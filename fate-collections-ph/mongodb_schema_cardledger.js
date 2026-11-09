/**
 * Fate Collections PH - MongoDB Compass Schema & Validation
 * Target Database: CardLedgerDB
 * Target Collection: CardLedger
 */

const schemaValidation = {
  $jsonSchema: {
    bsonType: "object",
    required: ["id", "description", "price", "status"],
    properties: {
      id: { bsonType: "string", description: "Unique SKU identifier" },
      year: { bsonType: "string" },
      brandSet: { bsonType: "string" },
      player: { bsonType: "string" },
      cardNumber: { bsonType: "string" },
      parallel: { bsonType: "string" },
      grade: { bsonType: "string" },
      description: { bsonType: "string" },
      price: { bsonType: ["int", "double", "long"] },
      qty: { bsonType: "int" },
      status: { enum: ["In Stock", "Reserved", "Sold"] },
      image: { bsonType: "string" },
      updatedAt: { bsonType: "string" }
    }
  }
};

db.createCollection("CardLedger", { validator: schemaValidation });
db.CardLedger.createIndex({ id: 1 }, { unique: true });
db.CardLedger.createIndex({ player: "text", description: "text" });
db.CardLedger.createIndex({ status: 1 });
