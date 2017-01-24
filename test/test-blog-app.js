const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');

const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogPostData());
  }
  return BlogPost.insertMany(seedData);
}

// generate an object for seed data
function generateBlogPostData() {
  return {
    title: faker.random.word(),
    content: faker.lorem.paragraph(),
    author: {
      firstName: faker.name.firstname(),
      lastName: faker.name.lastName()
    }
  }
}

// delete the entire database
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDataBase();
}


describe('Blog Post API resource', function() {
  // before the tests runs statr the server once
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  // before each test add data
  beforeEach(function() {
    return seedBlogPostData();
  });
  // after each test is done remove the database
  afterEach(function() {
    return tearDownDb();
  });
  // after all tests have been completed close out the server
  after(function() {
    return closeServer();
  });

describe('GET endpoint', function() {
  it('should return all existing blog posts', function() {
    let res;
    return chai.request(app)
      .get('/blogposts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.blogposts.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.blogposts.should.have.length.of(count);
      });
  });

  it('should return blog posts with correct fields', function() {
    let resBlogPost;
    return chai.request(app)
      .get('/blogposts')
      .then(function(res) {
        // add more stuff
      });
  });
});


});
