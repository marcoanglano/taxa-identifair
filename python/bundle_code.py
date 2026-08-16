import os

# Configurazione
OUTPUT_FILE = "full_project_code.md"
SRC_DIR = "src"

# Estensioni da includere
ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".css", ".sql"}

# Cartelle o file da ignorare completamente
IGNORE_DIRS = {"node_modules", ".git", "dist", "build", "coverage"}
IGNORE_FILES = {"package-lock.json", "yarn.lock", "bundle_code.py", "README.md", "UPDATER.md", "CHANGELOG.md"}


def bundle_project():
    root_dir = os.path.abspath(".")
    src_path = os.path.join(root_dir, SRC_DIR)

    if not os.path.exists(src_path):
        print(f"Errore: Cartella '{SRC_DIR}' non trovata in {root_dir}")
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        outfile.write(f"# Repository Code Overview\n\n")

        for dirpath, dirnames, filenames in os.walk(src_path):
            # Escludi cartelle non necessarie
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

            for filename in sorted(filenames):
                if filename in IGNORE_FILES:
                    continue

                ext = os.path.splitext(filename)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    file_path = os.path.join(dirpath, filename)
                    rel_path = os.path.relpath(file_path, root_dir)

                    # Determina il linguaggio per il blocco di codice Markdown
                    lang = ext.replace(".", "")
                    if lang in ["jsx", "tsx"]:
                        lang = "javascript"

                    print(f"Aggiungo: {rel_path}")

                    outfile.write(f"## File: `{rel_path}`\n\n")
                    outfile.write(f"```{lang}\n")

                    try:
                        with open(file_path, "r", encoding="utf-8") as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"// Errore nella lettura del file: {e}\n")

                    outfile.write("\n```\n\n---\n\n")

    print(f"\nCompletato! Il file generato è: {OUTPUT_FILE}")


if __name__ == "__main__":
    bundle_project()
