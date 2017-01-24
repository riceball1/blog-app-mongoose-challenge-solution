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
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  }
}

// delete the entire database
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
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
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.should.have.length.of(count);
      });
  });

  it('should return blog posts with correct fields', function() {
    let resBlogPost;
    return chai.request(app)
      .get('/blogposts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.bloposts.should.be.a('object');
        res.body.blogposts.should.have.length.of.at.least(1);

        res.body.blogposts.forEach(function(blogpost) {
          blogpost.should.be.a('object');
          blopost.should.include.keys('id', 'title', 'author', 'content', 'created');
          resBlogPost = res.body.blogposts[0];
          return BlogPost.findById(res.BlogPost.id);
        })
        .then(function(blogpost) {
          resBlogPost.id.should.equal(blogpost.id);
          resBlogPost.title.should.equal(blogpost.title);
          resBlogPost.author.should.contain(blogpost.author.firstName);
          esBlogPost.author.should.contain(blogpost.author.lastName);
          resBlogPost.content.should.equal(blogpost.content);
          resBlogPost.created.should.equal(blogpost.created);
        });
      });
  });

describe('POST endpoint', function() {
  it('should add a new blog post', function() {
    const newBlogPost = generateBlogPostData();

    return chai.request(app)
      .post('/blogposts')
      .send(newBlogPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        const expectedKeys = ['id', 'title', 'content', 'author'];
        res.body.should.be.a('object');
        res.body.should.include.keys(expectedKeys);
        res.body.title.should.equal(newBlogPost.title);
        res.body.id.should.not.be.null;
        res.body.content.should.equal(newBlogPost.content);
        res.body.author.firstName.should.equal(newBlogPost.author.firstName);
        res.body.author.lastName.shoud.equal(newBlogPost.author.lastName);
        return BlogPost.findById(res.body.id);
      })
      .then(function(blogpost) {
        blogpost.title.should.equal(newBlogPost.title);
        blogpost.content.should.equal(newBlogPost.content);
        blogpost.author.firstName.should.equal(newBlogPost.author.firstName);
        blogpost.author.lastName.should.equal(newBlogPost.author.lastName);
      });
  });
});

describe('PUT endpoint', function() {
  it('should update fields you send over', function() {
    const updateData = {
      "title": "foo bar",
      "content": "new content about blah blah blah"
    };

    return BlogPost
      .findOne()
      .exec()
      .then(function(blogpost) {
        return chai.request(app)
          .put(`/blogposts/${blogpost.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.shoud.have.status(201);
        return BlogPost.findById(updateData.id).exec();
      })
      .then(function(blogpost) {
        blogpost.title.should.equal(updateData.title);
        blogpost.content.should.equal(updateData.content);
      });
  });
});

describe('DELETE endpoint', function() {
  it('delete a blog post by id', function() {
    let blogpost;
    return BlogPost
    .findOne()
    .exec()
    .then(function(_blogpost) {
      blogpost = _blogpost;
      return chai.request(app).delete(`/blogposts/${blogpost.id}`);
    })
    .then(function(res) {
      res.should.have.status(204);
      return BlogPost.findById(blogpost.id).exec();
    })
    .then(function(_blogpost) {
      should.not.exist(_blogpost);
    });
  });
});

});
});
