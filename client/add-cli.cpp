#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <fstream>

using namespace std;

vector<string> split(string str, char delimiter) {
  vector<string> internal;
  stringstream ss(str); // Turn the string into a stream.
  string tok;
 
  while(getline(ss, tok, delimiter)) {
    internal.push_back(tok);
  }
 
  return internal;
}

int main() {
  if(argv[0] == "cli") {
    string input;
    while(getline(cin,input)) {
      vector<string> inputArr = split(input, " ");
      system(string("curl --data \"position=")+string(inputArr[0])+string("&direction=")+string(inputArr[1])+string("\" http://localhost/add"));
    }
  } else {
    ifstream inputFile(argv[1]);
    string line;
    while (getline(infile, line)) {
      vector<string> inputArr = split(line,"\"");
      system(string("curl --data \"position=")+string(inputArr[1])+string("&direction=")+string(inputArr[3])+string("\" http://localhost/add"));
    }
  }
  system("start firefox http://localhost/operate");
  return 0;
}
