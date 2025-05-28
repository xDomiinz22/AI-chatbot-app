from dotenv import load_dotenv
import os

path = os.path.join("default-env")
load_dotenv(dotenv_path=path, override=True)
