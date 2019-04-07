#include <iostream>
#include <vector>
#include <string>
#include <sstream>

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
  string input;
  while(cin>>input) {
    vector<string> inputArr = split(input, " ");
    system(string("curl --data \"position=")+string(inputArr[0])+string("&direction=")+string(inputArr[1])+string("\" http://localhost/add"));
  }
  system("firefox http://localhost/operate");
  return 0;
}
