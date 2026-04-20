import os
import re

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()

            new_content = content.replace("https://without.boats/blog/wakers/", "https://without.boats/blog/wakers-i/")
            new_content = new_content.replace("https://doc.rust-lang.org/reference/lifetimes.html", "https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html")

            if new_content != content:
                with open(path, "w") as f:
                    f.write(new_content)
                    print(f"Fixed {path}")
