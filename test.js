const {defineOneEntry} = require('oneentry');

const api = defineOneEntry('https://rn-beauty.oneentry.cloud', {
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibWFpbiIsInNlcmlhbE51bWJlciI6MSwiaWF0IjoxNzA3OTc4NzM2LCJleHAiOjE3Mzk1MTQ2NjB9.s6zIdGAT_oSw_MFgNxoyiS47roOoRjrea67FxzDHXNY',
});

const result = api.Admins.getAdminsInfo()
  .then(res => res)
  .catch(e => console.log(e));

console.log(Promise.resolve(result));
