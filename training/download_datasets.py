"""Fetch the two public datasets into training/data/ (run once before train.py)."""

import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')

ECML_URL = 'https://github.com/aeye-lab/ecml-ADHD.git'
CILIA_ZIP_URL = 'https://ndownloader.figshare.com/files/35980367'


def main():
    os.makedirs(DATA, exist_ok=True)

    ecml = os.path.join(DATA, 'ecml-ADHD')
    if not os.path.isdir(ecml):
        print('Cloning aeye-lab/ecml-ADHD ...')
        subprocess.run(['git', 'clone', '--depth', '1', ECML_URL, ecml], check=True)
    else:
        print('ECML dataset already present.')

    asd = os.path.join(DATA, 'asd')
    if not os.path.isdir(asd):
        zip_path = os.path.join(DATA, 'asd-eyetracking.zip')
        print('Downloading Cilia et al. ASD eye-tracking dataset (146 MB)...')
        urllib.request.urlretrieve(CILIA_ZIP_URL, zip_path)
        print('Extracting...')
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(DATA)
        # normalize folder name: zip contains "Eye-Tracking Dataset"
        extracted = os.path.join(DATA, 'Eye-Tracking Dataset')
        if os.path.isdir(extracted):
            os.rename(extracted, asd)
        os.remove(zip_path)
    else:
        print('ASD dataset already present.')

    print('Done.')


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.exit(f'git clone failed: {exc}')
