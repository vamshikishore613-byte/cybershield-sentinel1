// In-memory store (replace with real DB like MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');

const db = {
  users: [],
  cases: [],
  evidence: [],
  familyNetworks: [],
  scamNumbers: [],
  botSessions: [],
  transactions: [],
};

// Helper functions
const findById = (collection, id) => db[collection].find(item => item.id === id);
const findByField = (collection, field, value) => db[collection].find(item => item[field] === value);
const filterByField = (collection, field, value) => db[collection].filter(item => item[field] === value);

const insert = (collection, data) => {
  const item = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
  db[collection].push(item);
  return item;
};

const update = (collection, id, data) => {
  const idx = db[collection].findIndex(item => item.id === id);
  if (idx === -1) return null;
  db[collection][idx] = { ...db[collection][idx], ...data, updatedAt: new Date().toISOString() };
  return db[collection][idx];
};

const remove = (collection, id) => {
  const idx = db[collection].findIndex(item => item.id === id);
  if (idx === -1) return false;
  db[collection].splice(idx, 1);
  return true;
};

module.exports = { db, findById, findByField, filterByField, insert, update, remove };
