const SHA256 = require('crypto-js/sha256')

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp
    this.transactions = transactions
    this.previousHash = previousHash
    this.hash = this.calculateHash()
    this.nonce = 0
  }

  calculateHash() {
    return SHA256(
      this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce
    ).toString()
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.log('BLOCK MINED', this.hash)
  }
}

class Blockchain {
  constructor(difficulty = 2) {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = difficulty
    this.pendingTransactions = []
    this.miningReward = 100
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], '0')
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions)
    block.mineBlock(this.difficulty)
    console.log('Block successfully mined')
    this.chain.push(block)
    this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)]
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction)
  }

  getBalanceOfAddress(address) {
    return this.chain.reduce((amount, block) => {
      return (
        amount +
        block.transactions.reduce((transAmount, trans) => {
          return trans.fromAddress === address
            ? transAmount - trans.amount
            : trans.toAddress === address ? transAmount + trans.amount : transAmount
        }, 0)
      )
    }, 0)
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash
    newBlock.mineBlock(this.difficulty)
    this.chain.push(newBlock)
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
      return true
    }
  }
}

const chain = new Blockchain(2)
chain.createTransaction(new Transaction('address1', 'address2', 100))
chain.createTransaction(new Transaction('address2', 'address1', 50))
console.log('\n Starting the miner... ')
chain.minePendingTransactions('tacos-address')
console.log('\n Balance of wallet is: ', chain.getBalanceOfAddress('tacos-address'))
console.log('\n Starting the miner again...')
chain.minePendingTransactions('tacos-address')
console.log('\n Balance of wallet is: ', chain.getBalanceOfAddress('tacos-address'))
