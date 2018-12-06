const assert = require('assert');
const AssertionError = require('assert').AssertionError;
const Web3 = require('web3')

const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

const{ interface, bytecode } = require('../scripts/compile');

let accounts;
let usersContract;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();
  usersContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({ from: accounts[0], gas: '1000000'});
});

describe('the UsersContract', async() =>{
   
   it('should deploy', () => {
       console.log(usersContract.options.address);
       assert.ok(usersContract.options.address);
   });
   it ('should join a user', async() => {
       let name = "Fran";
       let surname = "Márquez";

       await usersContract.methods.join(name,surname)
        .send({from: accounts[0], gas: '500000'});      
   });
   it('shoul retrieve a user', async() => {
    let name = "Fran";
    let surname = "Márquez";

    await usersContract.methods.join(name,surname)
     .send({from: accounts[0], gas: '500000'}); 

     let user = await usersContract.methods.getUser(accounts[0]).call();

     assert.equal(name, user[0]);
     assert.equal(surname, user[1]);
   })

   it ('should not allow jining an account twice'), async() => {
    await usersContract.methods.join("Pedro","Lopez")
    .send({from: accounts[1], gas: '500000'});
    try{
        await usersContract.methods.join("Ana","Gómez")
        .send({from: accounts[0], gas: '500000'});
        assert.fail('Same account cant join twice');
    }
    catch(e){
        if(e instanceof AssertionError){
            assert.fail(e.message);
        }
    }
    
   }
});
