from inaSpeechSegmenter import Segmenter

import os
import sys
import json


input_file = os.path.abspath(sys.argv[1])

# 'smn' は入力信号を音声区間(speeech)、音楽区間(music)、ノイズ区間(noise)にラベル付けする
# detect_genderをTrueにすると、男性(male) / 女性(female)のラベルに細分化されるが、処理速度は遅くなる
# batch_size: default value (32) is slow, but works on any hardware
seg = Segmenter(vad_engine='smn', detect_gender=False, batch_size=32)


segs = seg(input_file)
# ('区間ラベル',  区間開始時刻（秒）,  区間終了時刻（秒）)というタプルのリスト

segs_format =[]
for seg in segs:
    s = {
        "type" : seg[0],
        "start" : seg[1],
        "end" : seg[2]
    }
    segs_format.append(s)
output ={
    "id":"id",
    "audio_url":"url",
    "segments":segs_format
}
# JSONファイルに書き込む
with open('output.json', 'w', encoding='utf-8') as fp:
    json.dump(output, fp, ensure_ascii=False, indent=4)


