var should  = require('should');
var redis = require('./setup/redisConnection');
var warlock = require('../lib/warlock')(redis);
require('./setup/redisFlush');

describe('locking', function() {
  it('sets lock', function (done) {
    warlock.lock('testLock', 1000, function(err, unlock) {
      should.not.exist(err);
      (typeof unlock).should.equal('function');

      done();
    });
  });

  it('returns true if key is locked', function(done) {
    warlock.isLocked('testLock', function(err, isLocked) {
      should.not.exist(err);
      isLocked.should.equal(true);

      done();
    });
  });

  it('does not set lock if it already exists', function(done) {
    warlock.lock('testLock', 1000, function(err, unlock) {
      should.not.exist(err);
      unlock.should.equal(false);

      done();
    });
  });

  it('does not alter expiry of lock if it already exists', function(done) {
    redis.pttl(warlock.makeKey('testLock'), function(err, ttl) {
      warlock.lock('testLock', 1000, function(err, unlock) {
        should.not.exist(err);
        unlock.should.equal(false);

        redis.pttl(warlock.makeKey('testLock'), function(err, ttl2) {
          (ttl2 <= ttl).should.equal(true);

          done();
        });
      });
    });
  });

  it('unlocks', function(done) {
    warlock.lock('unlock', 1000, function(err, unlock) {
      should.not.exist(err);
      unlock(done);
    });
  });

  it('returns false if key is unlocked', function(done) {
    warlock.isLocked('unlock', function(err, isLocked) {
      should.not.exist(err);
      isLocked.should.equal(false);
      
      done();
    });
  });
});
