#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <fstream>

using namespace std;

vector<string> split(const string &str, const string &delim)
{
  vector<string> tokens;
  size_t prev = 0, pos = 0;
  do
  {
    pos = str.find(delim, prev);
    if (pos == string::npos)
      pos = str.length();
    string token = str.substr(prev, pos - prev);
    if (!token.empty())
      tokens.push_back(token);
    prev = pos + delim.length();
  } while (pos < str.length() && prev < str.length());
  return tokens;
}

int main(int argc, char *argv[])
{
  if (string(argv[1]) == "cli")
  {
    string input;
    while (getline(cin, input))
    {
      vector<string> inputArr = split(input, " ");
      string cmd("");
      cmd += "curl -d \"position=";
      cmd += inputArr[0];
      cmd += "&direction=";
      cmd += inputArr[1];
      cmd += "\" -s https://ccins.andrew.at.tw/add > /dev/null";
      system(cmd.c_str());
    }
  }
  else
  {
    ifstream input(argv[1]);
    string line;
    while (getline(input, line))
    {
      vector<string> inputArr = split(line, ",");
      string cmd("");
      cmd += "curl -d \"position=";
      cmd += inputArr[0];
      cmd += "&direction=";
      cmd += inputArr[1];
      cmd += "\" -X POST -s https://ccins.andrew.at.tw/add > /dev/null &";
      system(cmd.c_str());
    }
  }
  system("python2.7 simulation.py &");
  return 0;
}
