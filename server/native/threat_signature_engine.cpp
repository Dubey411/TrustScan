#include <algorithm>
#include <cctype>
#include <fstream>
#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

struct Pattern {
    std::string category;
    std::string phrase;
    int weight;
};

struct Match {
    int patternIndex;
    std::size_t endPos;
};

struct Node {
    std::unordered_map<char, int> next;
    int fail = 0;
    std::vector<int> output;
};

class AhoCorasickEngine {
public:
    bool loadPatterns(const std::string& signaturesPath) {
        std::ifstream file(signaturesPath);
        if (!file.is_open()) {
            return false;
        }

        patterns_.clear();
        trie_.clear();
        trie_.push_back(Node{});

        std::string line;
        while (std::getline(file, line)) {
            if (line.empty()) {
                continue;
            }

            std::stringstream ss(line);
            std::string category;
            std::string weightStr;
            std::string phrase;

            if (!std::getline(ss, category, '\t')) continue;
            if (!std::getline(ss, weightStr, '\t')) continue;
            if (!std::getline(ss, phrase)) continue;

            Pattern pattern{category, normalize(phrase), std::stoi(weightStr)};
            if (pattern.phrase.empty()) {
                continue;
            }

            int patternIndex = static_cast<int>(patterns_.size());
            patterns_.push_back(pattern);
            insertPattern(pattern.phrase, patternIndex);
        }

        buildFailures();
        return !patterns_.empty();
    }

    std::vector<Match> scan(const std::string& text) const {
        std::vector<Match> matches;
        std::string normalized = normalize(text);
        int state = 0;

        for (std::size_t i = 0; i < normalized.size(); ++i) {
            const char ch = normalized[i];

            while (state != 0 && trie_[state].next.find(ch) == trie_[state].next.end()) {
                state = trie_[state].fail;
            }

            auto it = trie_[state].next.find(ch);
            if (it != trie_[state].next.end()) {
                state = it->second;
            }

            for (int patternIndex : trie_[state].output) {
                matches.push_back({patternIndex, i});
            }
        }

        return matches;
    }

    const Pattern& patternAt(int index) const {
        return patterns_[index];
    }

    std::size_t patternCount() const {
        return patterns_.size();
    }

private:
    static std::string normalize(const std::string& input) {
        std::string result;
        result.reserve(input.size());

        for (unsigned char ch : input) {
            if (std::isalnum(ch) || std::isspace(ch)) {
                result.push_back(static_cast<char>(std::tolower(ch)));
            } else {
                result.push_back(' ');
            }
        }

        std::string compact;
        compact.reserve(result.size());
        bool lastWasSpace = false;
        for (char ch : result) {
            if (std::isspace(static_cast<unsigned char>(ch))) {
                if (!lastWasSpace) {
                    compact.push_back(' ');
                    lastWasSpace = true;
                }
            } else {
                compact.push_back(ch);
                lastWasSpace = false;
            }
        }

        if (!compact.empty() && compact.front() == ' ') compact.erase(compact.begin());
        if (!compact.empty() && compact.back() == ' ') compact.pop_back();
        return compact;
    }

    void insertPattern(const std::string& phrase, int patternIndex) {
        int node = 0;
        for (char ch : phrase) {
            auto it = trie_[node].next.find(ch);
            if (it == trie_[node].next.end()) {
                trie_[node].next[ch] = static_cast<int>(trie_.size());
                trie_.push_back(Node{});
                node = static_cast<int>(trie_.size()) - 1;
            } else {
                node = it->second;
            }
        }
        trie_[node].output.push_back(patternIndex);
    }

    void buildFailures() {
        std::queue<int> q;

        for (const auto& edge : trie_[0].next) {
            q.push(edge.second);
        }

        while (!q.empty()) {
            int current = q.front();
            q.pop();

            for (const auto& edge : trie_[current].next) {
                char ch = edge.first;
                int nextNode = edge.second;
                int failState = trie_[current].fail;

                while (failState != 0 && trie_[failState].next.find(ch) == trie_[failState].next.end()) {
                    failState = trie_[failState].fail;
                }

                auto failIt = trie_[failState].next.find(ch);
                if (failIt != trie_[failState].next.end() && failIt->second != nextNode) {
                    trie_[nextNode].fail = failIt->second;
                }

                const auto& failOutput = trie_[trie_[nextNode].fail].output;
                trie_[nextNode].output.insert(
                    trie_[nextNode].output.end(),
                    failOutput.begin(),
                    failOutput.end()
                );

                q.push(nextNode);
            }
        }
    }

    std::vector<Node> trie_;
    std::vector<Pattern> patterns_;
};

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: threat_signature_engine <signatures-file>" << std::endl;
        return 1;
    }

    AhoCorasickEngine engine;
    if (!engine.loadPatterns(argv[1])) {
        std::cerr << "Failed to load signatures" << std::endl;
        return 2;
    }

    std::string inputLine;
    while (std::getline(std::cin, inputLine)) {
        std::vector<Match> rawMatches = engine.scan(inputLine);
        std::vector<bool> seen(engine.patternCount(), false);
        std::vector<std::string> categories;
        std::unordered_set<std::string> categorySet;
        std::vector<std::string> serializedMatches;
        int score = 0;

        for (const Match& match : rawMatches) {
            if (seen[match.patternIndex]) {
                continue;
            }

            seen[match.patternIndex] = true;
            const Pattern& pattern = engine.patternAt(match.patternIndex);
            score += pattern.weight;

            if (categorySet.insert(pattern.category).second) {
                categories.push_back(pattern.category);
            }

            serializedMatches.push_back(
                pattern.category + "::" + pattern.phrase + "::" + std::to_string(pattern.weight)
            );
        }

        std::ostringstream output;
        output << score << '\t';

        for (std::size_t i = 0; i < categories.size(); ++i) {
            if (i > 0) output << ',';
            output << categories[i];
        }

        output << '\t';
        for (std::size_t i = 0; i < serializedMatches.size(); ++i) {
            if (i > 0) output << "|||";
            output << serializedMatches[i];
        }

        std::cout << output.str() << std::endl;
    }

    return 0;
}
