'use strict';

const chai = require('chai'),
  expect = chai.expect,
  Router = require('../index');

describe('Base', () => {
  it('Short constructor', () => {
    const router1 = new Router();
    const router2 = Router();
    const router3 = Router();

    expect(router1 instanceof Router).to.be.ok;
    expect(router2 instanceof Router).to.be.ok;
    expect(router3 instanceof Router).to.be.ok;

    expect(router1 === router2).to.not.be.ok;
    expect(router2 === router3).to.not.be.ok;
    expect(router1 === router3).to.not.be.ok;

  });
});
