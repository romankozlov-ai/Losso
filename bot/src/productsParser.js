// Products Parser Module
// Loads and parses YML product feed

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { parseString } = require('xml2js');

class ProductsParser {
  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.lastLoad = null;
  }

  // Load YML file
  loadYML(filePath = './config/products.xml') {
    return new Promise((resolve, reject) => {
      try {
        const xmlContent = fs.readFileSync(filePath, 'utf8');
        
        parseString(xmlContent, { explicitArray: false }, (err, result) => {
          if (err) {
            console.error('❌ XML Parse error:', err.message);
            reject(err);
            return;
          }

          this.parseCatalog(result);
          this.lastLoad = new Date();
          console.log(`✅ Loaded ${this.products.size} products`);
          resolve(this.products.size);
        });
      } catch (error) {
        console.error('❌ Load error:', error.message);
        reject(error);
      }
    });
  }

  // Parse YML catalog structure
  parseCatalog(data) {
    this.products.clear();
    this.categories.clear();

    const shop = data?.yml_catalog?.shop;
    if (!shop) {
      console.error('❌ Invalid YML structure');
      return;
    }

    // Parse categories
    if (shop.categories?.category) {
      const categories = Array.isArray(shop.categories.category) 
        ? shop.categories.category 
        : [shop.categories.category];
      
      categories.forEach(cat => {
        this.categories.set(cat.$.id, {
          id: cat.$.id,
          parentId: cat.$.parentId,
          name: cat._
        });
      });
    }

    // Parse offers (products)
    if (shop.offers?.offer) {
      const offers = Array.isArray(shop.offers.offer) 
        ? shop.offers.offer 
        : [shop.offers.offer];

      offers.forEach(offer => {
        // Skip unavailable products
        if (offer.$.available === 'false') return;

        const product = {
          id: offer.$.id,
          available: offer.$.available === 'true',
          url: offer.url,
          price: parseInt(offer.price) || 0,
          currency: offer.currencyId,
          categoryId: offer.categoryId,
          name: offer.name,
          vendor: offer.vendor || 'LOSSO',
          vendorCode: offer.vendorCode,
          description: this.cleanDescription(offer.description),
          pictures: this.parsePictures(offer.picture),
          params: this.parseParams(offer.param)
        };

        this.products.set(product.id, product);
      });
    }
  }

  // Clean HTML from description
  cleanDescription(desc) {
    if (!desc) return '';
    return desc
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  }

  // Parse picture URLs
  parsePictures(picture) {
    if (!picture) return [];
    if (Array.isArray(picture)) return picture;
    return [picture];
  }

  // Parse parameters
  parseParams(param) {
    const params = {};
    if (!param) return params;
    
    const paramArray = Array.isArray(param) ? param : [param];
    paramArray.forEach(p => {
      if (p.$?.name) {
        params[p.$.name] = p._;
      }
    });
    
    return params;
  }

  // Get product by ID
  getProduct(id) {
    return this.products.get(id.toString());
  }

  // Get all products
  getAllProducts() {
    return Array.from(this.products.values());
  }

  // Get available products only
  getAvailableProducts() {
    return this.getAllProducts().filter(p => p.available);
  }

  // Search products by name
  searchProducts(query, limit = 10) {
    const lowerQuery = query.toLowerCase();
    return this.getAvailableProducts()
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  }

  // Get random products for posts
  getRandomProducts(count = 5) {
    const available = this.getAvailableProducts();
    const shuffled = available.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get category name
  getCategoryName(categoryId) {
    return this.categories.get(categoryId)?.name || 'Інше';
  }

  // Get products by category
  getProductsByCategory(categoryId) {
    return this.getAvailableProducts()
      .filter(p => p.categoryId === categoryId);
  }

  // Get statistics
  getStats() {
    const all = this.getAllProducts();
    return {
      total: all.length,
      available: all.filter(p => p.available).length,
      categories: this.categories.size,
      lastLoad: this.lastLoad
    };
  }
}

// Singleton instance
const productsParser = new ProductsParser();

module.exports = { productsParser, ProductsParser };
