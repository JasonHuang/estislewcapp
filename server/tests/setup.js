const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// 在所有测试开始前连接数据库
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// 每个测试后清理数据库
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

// 所有测试结束后关闭数据库连接
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
}); 