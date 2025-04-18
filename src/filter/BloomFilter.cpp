#include "BloomFilter.h"

  BloomFilter::BloomFilter(size_t arraySize, int hashCount) {
    // כאן תוכל לשמור את הגודל ומספר ההאשינגים או להשתמש בהם
    // לדוגמה:
    this->arraySize = arraySize;
    this->hashCount = hashCount;
    // (תוסיף שדות במחלקה לפי הצורך)
  }
  bool BloomFilter::add(const string &item){
    return false;
  }
  bool BloomFilter::isBlacklisted(const string& item) const {
    return false;

  }
  bool BloomFilter::queryUrl(const string &url){
    return false;

  }
  bool BloomFilter::loadFromFile(){
    return false;

  }
  bool BloomFilter::saveToFile(){
    return false;
  }