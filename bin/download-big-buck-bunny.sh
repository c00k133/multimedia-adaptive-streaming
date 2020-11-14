#!/bin/bash

# WARNING:
# This task can take quite a while

# Alternatives: 1sec; 2sec; 4sec; 6sec; 10sec; 15sec
FOLDER='1sec'
URL="http://ftp.itec.aau.at/datasets/DASHDataset2014/BigBuckBunny/${FOLDER}/"

DATA_DIR='data/big-buck-bunny'
mkdir --parents "${DATA_DIR}"
cd "${DATA_DIR}" || exit
wget \
    --continue \
    --recursive \
    --no-parent \
    --no-host-directories \
    --cut-dirs=3 \
    --reject index.html \
    "${URL}"
