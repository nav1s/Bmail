#pragma once

#include "Ifilter.h"
#include <fstream>
#include <string>

using namespace std;
class BloomFilter: public Ifilter {
public:
  bool add(const string &item);
  bool isBlacklisted(const string& item) const;
  bool queryUrl(const string &url);
  bool loadFromFile();
  bool saveToFile();
  BloomFilter(size_t size, const vector<HashFunction>& hashFuncs){
private:
  string file_name;
  ifstream file;
};

