#pragma once

#include "IFilter.h"
#include <fstream>
#include <string>
#include <vector>

using namespace std;
class BloomFilter: public IFilter {
public:
  BloomFilter(size_t arraySize, int hashCount);
  bool add(const string &item);
  bool isBlacklisted(const string& item) const;
  bool queryUrl(const string &url);
  bool loadFromFile();
  bool saveToFile();
private:
  string file_name;
  ifstream file;
  size_t arraySize;
  int hashCount;
  vector<bool> bitArray;
};

