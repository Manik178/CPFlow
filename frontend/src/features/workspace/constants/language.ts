export interface LanguageConfig {
  label: string;
  monacoId: string;
  fileName: string;
  template: string;
}

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  cpp: {
    label: "C++ (GCC 12)",
    monacoId: "cpp",
    fileName: "main.cpp",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    
    return 0;
}`,
  },
  python: {
    label: "Python 3",
    monacoId: "python",
    fileName: "main.py",
    template: `import sys
input = sys.stdin.readline

`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    fileName: "Main.java",
    template: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        
    }
}`,
  },
};
