require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');
process.env.JWT_SECRET = 'change-this-packrat';

require('dotenv').config();

global.expect = expect;
global.supertest = supertest;