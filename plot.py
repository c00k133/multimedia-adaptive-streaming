import json
import os.path
import pandas as pd
import numpy as np
from itertools import chain

import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

plt.rcParams.update({'font.size': 12})

DATA_FILE = os.path.join('path', 'to', 'analytics')

with open(DATA_FILE, 'r') as fd:
    raw_data = json.load(fd)

raw_metrics = raw_data['metrics']
metrics = pd.DataFrame(raw_metrics).T.dropna()

decrease = pd.Series(
    chain(
        (5000 for _ in range(30)),
        (3000 for _ in range(30)),
        (2000 for _ in range(30)),
        (1500 for _ in range(30)),
        (1125 for _ in range(30)),
    ),
    dtype='category'
)

increase = pd.Series(
    chain(
        (1125 for _ in range(30)),
        (1500 for _ in range(30)),
        (2000 for _ in range(30)),
        (3000 for _ in range(30)),
        (5000 for _ in range(30)),
    ),
    dtype='category'
)

increase_decrease = pd.Series(
    chain(
        (1125 for _ in range(30)),
        (1500 for _ in range(30)),
        (2000 for _ in range(30)),
        (3000 for _ in range(30)),
        (5000 for _ in range(60)),
        (3000 for _ in range(30)),
        (2000 for _ in range(30)),
        (1500 for _ in range(30)),
        (1125 for _ in range(30)),
    ),
    dtype='category',
)

decrease_increase = pd.Series(
    chain(
        (5000 for _ in range(30)),
        (3000 for _ in range(30)),
        (2000 for _ in range(30)),
        (1500 for _ in range(30)),
        (1125 for _ in range(30)),
        (1500 for _ in range(30)),
        (2000 for _ in range(30)),
        (3000 for _ in range(30)),
        (5000 for _ in range(30)),
    ),
    dtype='category',
)

experiment_bandwidth = decrease_increase
trim_value = len(experiment_bandwidth)

trimmed_metrics = metrics[:trim_value]
casted_index = trimmed_metrics.index.astype(int)
formatted_metrics = trimmed_metrics.set_index(
    (casted_index - casted_index.min()) // 1000
)

buffer_level = formatted_metrics.bufferLevel
bitrate = formatted_metrics.bitrate.map(lambda rate: rate // 1000)
calculated_bitrate = pd.DataFrame(
    raw_data['calculatedBitrate']
)[:trim_value].calculatedBitrate.map(lambda rate: rate // 1000)


ax_buffer_level = buffer_level.plot.line(
    color='maroon',
    figsize=(12, 10),
    ylabel='Buffer Level (seconds)',
    xlabel='Seconds since video load',
    grid=True,
    style='.-',
    rot=50,
    x_compat=True,
)
bl_line, _ = ax_buffer_level.get_legend_handles_labels()

ax_bitrate = ax_buffer_level.twinx()
ax_bitrate.spines['right'].set_position(('axes', 1.0))
bitrate.plot.line(
    color='#111111',
    ax=ax_bitrate,
    ylabel='Video Bitrate (Kbps)',
    style='+',
    yticks=bitrate,
)
br_line, _ = ax_bitrate.get_legend_handles_labels()


ax_calculated_bitrate = ax_buffer_level.twinx()
ax_calculated_bitrate.spines['right'].set_position(
    ('axes', 1.1)
)
calculated_bitrate.plot.line(
    color='dimgray',
    ax=ax_calculated_bitrate,
    ylabel='Calculated Bitrate (Kbps)',
    linestyle='-',
    marker='x',
    linewidth=0.5,
)
cbr_line, _ = ax_calculated_bitrate.get_legend_handles_labels()


lines = bl_line + br_line + cbr_line
labels = [
    'Buffer Level (seconds)',
    'Video Bitrate (Kbps)',
    'Calculated Bitrate (Kbps)',
]
ax_buffer_level.legend(lines, labels)

ax_buffer_level.xaxis.set_major_locator(ticker.MultipleLocator(10))
ax_buffer_level.xaxis.set_minor_locator(ticker.MultipleLocator(2))

ax_buffer_level.yaxis.set_major_locator(
    ticker.MultipleLocator(1)
)
ax_buffer_level.yaxis.set_minor_locator(
    ticker.MultipleLocator(0.2)
)

ax_buffer_level.tick_params(
    axis='both',
    which='major',
    labelsize=10,
)

ax_buffer_level.get_legend().set_bbox_to_anchor(
    (1.47, 1.0)
)

ax_buffer_level.pcolor(
    formatted_metrics.index,
    ax_buffer_level.get_ylim(),
    experiment_bandwidth.values[np.newaxis],
    cmap='autumn',
    alpha=0.5,
    linewidth=0,
    antialiased=True,  # https://stackoverflow.com/a/27096694
)
ax_buffer_level.grid(True)  # https://github.com/matplotlib/matplotlib/issues/15600

plt.savefig(
    f'{DATA_FILE}.png',
    dpi=300,
    bbox_inches='tight'
)
