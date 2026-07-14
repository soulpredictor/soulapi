from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import string
import time
from threading import Lock
import requests
import telebot
from datetime import datetime, timezone
import json
from threading import Lock
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import string
import time
from threading import Lock
import requests
from datetime import datetime
import json
import os
import threading
import sys
import logging
from time import sleep
from datetime import datetime, timedelta
import supabase
from advanced_predictor import AdvancedCrashPredictor
import subprocess
import platform
import shutil
from functools import wraps
import smtplib
from email.mime.text import MIMEText
import re
from collections import Counter

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize Supabase client (kept for other features if needed)
SUPABASE_URL = "https://zivchqddkiysjvjifrnv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmNocWRka2l5c2p2amlmcm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgwNjQyMywiZXhwIjoyMDYwMzgyNDIzfQ.wm2ffRacJsWcPJc2mDWKiziODWO6QWuor-LDizLIRoU"

# Create a Supabase client (kept for other features if needed)
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# NVIDIA-hosted OpenAI-compatible blackjack advisor config
NVIDIA_OPENAI_BASE_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_OPENAI_MODEL = "minimaxai/minimax-m2.7"
NVIDIA_OPENAI_MODEL_KIMI = "moonshotai/kimi-k2.5"
NVIDIA_OPENAI_MODEL_DEEPSEEK = "deepseek-ai/deepseek-v4-pro"
NVIDIA_OPENAI_API_KEY = os.getenv(
    "NVIDIA_OPENAI_API_KEY",
    "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",
)
_nvidia_openai_client = None

BJ_ENSEMBLE_MODELS = [
    {
        "name": "minimax",
        "model": NVIDIA_OPENAI_MODEL,
        "temperature": 1,
        "top_p": 1,
        "max_tokens": 16384,
        "extra_body": {"chat_template_kwargs": {"thinking": True}},
    },
    {
        "name": "kimi",
        "model": NVIDIA_OPENAI_MODEL_KIMI,
        "temperature": 1,
        "top_p": 1,
        "max_tokens": 16384,
        "extra_body": {"chat_template_kwargs": {"thinking": True}},
    },
    {
        "name": "deepseek",
        "model": NVIDIA_OPENAI_MODEL_DEEPSEEK,
        "temperature": 1,
        "top_p": 1,
        "max_tokens": 16384,
        "extra_body": {"chat_template_kwargs": {"thinking": True, "reasoning_effort": "max"}},
    },
]

# JSON file paths for key, access and ticket storage
KEYS_JSON_FILE = "keys.json"
TIMED_KEYS_JSON_FILE = "timedKeys.json"
INVALID_KEYS_JSON_FILE = "invalid_keys.json"
SESSIONS_JSON_FILE = "sessions.json"
ACCESS_REQUESTS_JSON_FILE = "access_requests.json"
TICKETS_JSON_FILE = "tickets.json"
USERS_JSON_FILE = "users.json"

ADMIN_CREDENTIAL = "orpx678"
ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60
ADMIN_SESSIONS = {}

SMTP_EMAIL = "soulgenzai@gmail.com"
SMTP_PASSWORD = "wbvdddxqmehbigcj"
# Protected variables - stored directly in backend.py (easier to edit)
PROTECTED_VARS = {
    "gemHTML": """<button class="tile gem svelte-12ha7jh" data-testid="mines-tile-5" data-revealed="true" style="--tile-shadow-inset: -0.15em; --shadow: 0.3em; --tile-shadow-lg: 0.44999999999999996em; --small-shadow: -0.15em; --duration: 300ms; --fetch-duration: 600ms;" disabled=""><div class="gem svelte-1qwk2y9 revealed" style="--mine: url(/_app/immutable/assets/gem-none.Bcv6X_BH.svg); --duration: 300ms;" bis_skin_checked="1"><div class="motion svelte-1qwk2y9" bis_skin_checked="1"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 308 280" width="308" height="280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px); content-visibility: visible;"><defs><clipPath id="__lottie_element_13"><rect width="308" height="280" x="0" y="0"></rect></clipPath></defs><g clip-path="url(#__lottie_element_13)"><g transform="matrix(4,0,0,4,0.579010009765625,0)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,38.30699920654297,35)"><path fill="rgb(5,29,39)" fill-opacity="1" d=" M-0.2809999883174896,35 C-0.2809999883174896,35 -0.29600000381469727,35 -0.29600000381469727,35 C-1.0740000009536743,34.99599838256836 -1.815000057220459,34.6619987487793 -2.3340001106262207,34.082000732421875 C-2.3340001106262207,34.082000732421875 -37.606998443603516,-5.380000114440918 -37.606998443603516,-5.380000114440918 C-38.409000396728516,-6.2769999504089355 -38.53499984741211,-7.591000080108643 -37.91899871826172,-8.625 C-37.91899871826172,-8.625 -27.281999588012695,-26.45400047302246 -27.281999588012695,-26.45400047302246 C-26.988000869750977,-26.94700050354004 -26.547000885009766,-27.336000442504883 -26.020000457763672,-27.56599998474121 C-26.020000457763672,-27.56599998474121 -15.1899995803833,-32.29399871826172 -15.1899995803833,-32.29399871826172 C-14.991000175476074,-32.38100051879883 -14.781999588012695,-32.444000244140625 -14.567999839782715,-32.481998443603516 C-14.567999839782715,-32.481998443603516 -0.5709999799728394,-34.95800018310547 -0.5709999799728394,-34.95800018310547 C-0.2529999911785126,-35.013999938964844 0.0729999989271164,-35.013999938964844 0.38999998569488525,-34.95800018310547 C0.38999998569488525,-34.95800018310547 14.312999725341797,-32.481998443603516 14.312999725341797,-32.481998443603516 C14.526000022888184,-32.444000244140625 14.732999801635742,-32.38100051879883 14.930000305175781,-32.29499816894531 C14.930000305175781,-32.29499816894531 26.114999771118164,-27.423999786376953 26.114999771118164,-27.423999786376953 C26.1560001373291,-27.4060001373291 26.197999954223633,-27.386999130249023 26.23900032043457,-27.367000579833984 C26.23900032043457,-27.367000579833984 26.242000579833984,-27.364999771118164 26.242000579833984,-27.364999771118164 C26.242000579833984,-27.364999771118164 26.243999481201172,-27.36400032043457 26.243999481201172,-27.36400032043457 C26.243999481201172,-27.36400032043457 26.2450008392334,-27.36400032043457 26.246000289916992,-27.363000869750977 C26.246000289916992,-27.363000869750977 26.249000549316406,-27.36199951171875 26.249000549316406,-27.36199951171875 C26.249000549316406,-27.36199951171875 26.249000549316406,-27.361000061035156 26.25,-27.361000061035156 C26.492000579833984,-27.240999221801758 26.711999893188477,-27.086999893188477 26.9060001373291,-26.9060001373291 C26.9060001373291,-26.905000686645508 26.9060001373291,-26.905000686645508 26.9060001373291,-26.905000686645508 C26.906999588012695,-26.90399932861328 26.908000946044922,-26.902999877929688 26.909000396728516,-26.902000427246094 C27.059999465942383,-26.760000228881836 27.195999145507812,-26.60099983215332 27.312999725341797,-26.424999237060547 C27.31399917602539,-26.424999237060547 27.31399917602539,-26.423999786376953 27.31399917602539,-26.423999786376953 C27.31399917602539,-26.423999786376953 27.31399917602539,-26.42300033569336 27.31399917602539,-26.42300033569336 C27.344999313354492,-26.378000259399414 27.37299919128418,-26.332000732421875 27.402000427246094,-26.284000396728516 C27.402000427246094,-26.284000396728516 37.926998138427734,-8.402000427246094 37.926998138427734,-8.402000427246094 C38.53900146484375,-7.361000061035156 38.402000427246094,-6.041999816894531 37.58700180053711,-5.14900016784668 C37.58700180053711,-5.14900016784668 1.7519999742507935,34.104000091552734 1.7519999742507935,34.104000091552734 C1.2309999465942383,34.67499923706055 0.492000013589859,35 -0.2809999883174896,35z"></path></g><g opacity="1" transform="matrix(1,0,0,1,38.30699920654297,35)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M25.023000717163086,-24.89699935913086 C25.023000717163086,-24.89699935913086 13.831999778747559,-29.77199935913086 13.831999778747559,-29.77199935913086 C13.831999778747559,-29.77199935913086 -0.09099999815225601,-32.24700164794922 -0.09099999815225601,-32.24700164794922 C-0.09099999815225601,-32.24700164794922 -14.088000297546387,-29.77199935913086 -14.088000297546387,-29.77199935913086 C-14.088000297546387,-29.77199935913086 -24.917999267578125,-25.04400062561035 -24.917999267578125,-25.04400062561035 C-24.917999267578125,-25.04400062561035 -35.55400085449219,-7.215000152587891 -35.55400085449219,-7.215000152587891 C-35.55400085449219,-7.215000152587891 -0.2809999883174896,32.24700164794922 -0.2809999883174896,32.24700164794922 C-0.2809999883174896,32.24700164794922 35.55400085449219,-7.00600004196167 35.55400085449219,-7.00600004196167 C35.55400085449219,-7.00600004196167 25.023000717163086,-24.89699935913086 25.023000717163086,-24.89699935913086z"></path></g><g opacity="1" transform="matrix(1,0,0,1,30.392000198364258,28.7549991607666)"><path fill="rgb(6,227,3)" fill-opacity="1" d=" M-8.263999938964844,-10.008000373840332 C-8.263999938964844,-10.008000373840332 -6.172999858856201,10.008000373840332 -6.172999858856201,10.008000373840332 C-6.172999858856201,10.008000373840332 8.263999938964844,-6.982999801635742 8.263999938964844,-6.982999801635742 C8.263999938964844,-6.982999801635742 -8.263999938964844,-10.008000373840332 -8.263999938964844,-10.008000373840332z"></path></g><g opacity="1" transform="matrix(1,0,0,1,64.11799621582031,19.048999786376953)"><path fill="rgb(5,169,2)" fill-opacity="1" d=" M9.743000030517578,8.944999694824219 C9.743000030517578,8.944999694824219 -0.7879999876022339,-8.944999694824219 -0.7879999876022339,-8.944999694824219 C-0.7879999876022339,-8.944999694824219 -9.743000030517578,-0.041999999433755875 -9.743000030517578,-0.041999999433755875 C-9.743000030517578,-0.041999999433755875 9.743000030517578,8.944999694824219 9.743000030517578,8.944999694824219z"></path></g><g opacity="1" transform="matrix(1,0,0,1,62.303001403808594,28.743000030517578)"><path fill="rgb(3,189,2)" fill-opacity="1" d=" M-11.557999610900879,9.736000061035156 C-11.557999610900879,9.736000061035156 11.557999610900879,-0.7490000128746033 11.557999610900879,-0.7490000128746033 C11.557999610900879,-0.7490000128746033 -7.928999900817871,-9.736000061035156 -7.928999900817871,-9.736000061035156 C-7.928999900817871,-9.736000061035156 -11.557999610900879,9.736000061035156 -11.557999610900879,9.736000061035156z"></path></g><g opacity="1" transform="matrix(1,0,0,1,46.43199920654297,28.757999420166016)"><path fill="rgb(1,228,1)" fill-opacity="1" d=" M-7.941999912261963,-6.822000026702881 C-7.941999912261963,-6.822000026702881 4.245999813079834,9.75100040435791 4.245999813079834,9.75100040435791 C4.245999813079834,9.75100040435791 4.313000202178955,9.720999717712402 4.313000202178955,9.720999717712402 C4.313000202178955,9.720999717712402 7.941999912261963,-9.75100040435791 7.941999912261963,-9.75100040435791 C7.941999912261963,-9.75100040435791 -7.941999912261963,-6.822000026702881 -7.941999912261963,-6.822000026702881z"></path></g><g opacity="1" transform="matrix(1,0,0,1,37.44900131225586,30.350000381469727)"><path fill="rgb(0,212,3)" fill-opacity="1" d=" M-13.229999542236328,8.413000106811523 C-13.229999542236328,8.413000106811523 13.229999542236328,8.15999984741211 13.229999542236328,8.15999984741211 C13.229999542236328,8.15999984741211 1.0410000085830688,-8.413000106811523 1.0410000085830688,-8.413000106811523 C1.0410000085830688,-8.413000106811523 -13.229999542236328,8.413000106811523 -13.229999542236328,8.413000106811523z"></path></g><g opacity="1" transform="matrix(1,0,0,1,13.486000061035156,28.83799934387207)"><path fill="rgb(8,252,2)" fill-opacity="1" d=" M-10.732999801635742,-1.0520000457763672 C-10.732999801635742,-1.0520000457763672 10.732999801635742,9.925000190734863 10.732999801635742,9.925000190734863 C10.732999801635742,9.925000190734863 8.807000160217285,-9.925000190734863 8.807000160217285,-9.925000190734863 C8.807000160217285,-9.925000190734863 -10.732999801635742,-1.0520000457763672 -10.732999801635742,-1.0520000457763672z"></path></g><g opacity="1" transform="matrix(1,0,0,1,37.481998443603516,52.862998962402344)"><path fill="rgb(8,252,2)" fill-opacity="1" d=" M13.196999549865723,-14.354000091552734 C13.196999549865723,-14.354000091552734 -13.262999534606934,-14.10099983215332 -13.262999534606934,-14.10099983215332 C-13.262999534606934,-14.10099983215332 0.5450000166893005,14.383000373840332 0.5450000166893005,14.383000373840332 C0.5450000166893005,14.383000373840332 13.196000099182129,-14.02299976348877 13.196000099182129,-14.02299976348877 C13.196000099182129,-14.02299976348877 13.262999534606934,-14.383000373840332 13.262999534606934,-14.383000373840332 C13.262999534606934,-14.383000373840332 13.196999549865723,-14.354000091552734 13.196999549865723,-14.354000091552734z"></path></g><g opacity="1" transform="matrix(1,0,0,1,55.944000244140625,47.62099838256836)"><path fill="rgb(1,153,2)" fill-opacity="1" d=" M-5.198999881744385,-9.142000198364258 C-5.198999881744385,-9.142000198364258 -5.265999794006348,-8.781000137329102 -5.265999794006348,-8.781000137329102 C-5.265999794006348,-8.781000137329102 -17.91699981689453,19.625999450683594 -17.91699981689453,19.625999450683594 C-17.91699981689453,19.625999450683594 17.91699981689453,-19.625999450683594 17.91699981689453,-19.625999450683594 C17.91699981689453,-19.625999450683594 -5.198999881744385,-9.142000198364258 -5.198999881744385,-9.142000198364258z"></path></g><g opacity="1" transform="matrix(1,0,0,1,20.388999938964844,47.51599884033203)"><path fill="rgb(1,226,0)" fill-opacity="1" d=" M-17.636999130249023,-19.729999542236328 C-17.636999130249023,-19.729999542236328 17.636999130249023,19.729999542236328 17.636999130249023,19.729999542236328 C17.636999130249023,19.729999542236328 3.8289999961853027,-8.753000259399414 3.8289999961853027,-8.753000259399414 C3.8289999961853027,-8.753000259399414 -17.636999130249023,-19.729999542236328 -17.636999130249023,-19.729999542236328z"></path></g><g opacity="1" transform="matrix(1,0,0,1,38.35900115966797,12.345000267028809)"><path fill="rgb(8,252,2)" fill-opacity="1" d=" M13.779000282287598,-7.117000102996826 C13.779000282287598,-7.117000102996826 -0.14399999380111694,-9.592000007629395 -0.14399999380111694,-9.592000007629395 C-0.14399999380111694,-9.592000007629395 -14.140999794006348,-7.117000102996826 -14.140999794006348,-7.117000102996826 C-14.140999794006348,-7.117000102996826 -24.97100067138672,-2.3889999389648438 -24.97100067138672,-2.3889999389648438 C-24.97100067138672,-2.3889999389648438 -19.09000015258789,3.5269999504089355 -19.09000015258789,3.5269999504089355 C-19.09000015258789,3.5269999504089355 -16.06599998474121,6.567999839782715 -16.06599998474121,6.567999839782715 C-16.06599998474121,6.567999839782715 -8.567999839782715,7.9670000076293945 -8.567999839782715,7.9670000076293945 C-8.567999839782715,7.9670000076293945 0.13199999928474426,9.592000007629395 0.13199999928474426,9.592000007629395 C0.13199999928474426,9.592000007629395 16.013999938964844,6.660999774932861 16.013999938964844,6.660999774932861 C16.013999938964844,6.660999774932861 24.97100067138672,-2.242000102996826 24.97100067138672,-2.242000102996826 C24.97100067138672,-2.242000102996826 13.779000282287598,-7.117000102996826 13.779000282287598,-7.117000102996826z"></path></g><g opacity="1" transform="matrix(1,0,0,1,12.52299976348877,18.871000289916992)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M6.747000217437744,-2.999000072479248 C6.747000217437744,-2.999000072479248 0.8659999966621399,-8.914999961853027 0.8659999966621399,-8.914999961853027 C0.8659999966621399,-8.914999961853027 -9.770000457763672,8.914999961853027 -9.770000457763672,8.914999961853027 C-9.770000457763672,8.914999961853027 9.770000457763672,0.041999999433755875 9.770000457763672,0.041999999433755875 C9.770000457763672,0.041999999433755875 6.747000217437744,-2.999000072479248 6.747000217437744,-2.999000072479248z"></path></g><g opacity="1" transform="matrix(1,0,0,1,25.80299949645996,6.790999889373779)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M-11.90999984741211,4.038000106811523 C-11.90999984741211,4.038000106811523 -1.437000036239624,-1.3650000095367432 -1.437000036239624,-1.3650000095367432 C-1.437000036239624,-1.3650000095367432 12.413000106811523,-4.038000106811523 12.413000106811523,-4.038000106811523 C12.413000106811523,-4.038000106811523 -1.5829999446868896,-1.562999963760376 -1.5829999446868896,-1.562999963760376 C-1.5829999446868896,-1.562999963760376 -12.413000106811523,3.1649999618530273 -12.413000106811523,3.1649999618530273 C-12.413000106811523,3.1649999618530273 -11.90999984741211,4.038000106811523 -11.90999984741211,4.038000106811523z"></path></g><g opacity="1" transform="matrix(1,0,0,1,22.658000946044922,28.836999893188477)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M-0.36500000953674316,-9.925000190734863 C-0.36500000953674316,-9.925000190734863 1.5609999895095825,9.925000190734863 1.5609999895095825,9.925000190734863 C1.5609999895095825,9.925000190734863 -1.5609999895095825,-9.788999557495117 -1.5609999895095825,-9.788999557495117 C-1.5609999895095825,-9.788999557495117 -0.36500000953674316,-9.925000190734863 -0.36500000953674316,-9.925000190734863z"></path></g><g opacity="1" transform="matrix(1,0,0,1,30.391000747680664,20.697999954223633)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M-8.097999572753906,-1.7860000133514404 C-8.097999572753906,-1.7860000133514404 8.097999572753906,1.2380000352859497 8.097999572753906,1.2380000352859497 C8.097999572753906,1.2380000352859497 7.635000228881836,1.7860000133514404 7.635000228881836,1.7860000133514404 C7.635000228881836,1.7860000133514404 -8.097999572753906,-1.7860000133514404 -8.097999572753906,-1.7860000133514404z"></path></g><g opacity="1" transform="matrix(1,0,0,1,58.165000915527344,14.6899995803833)"><path fill="rgb(86,252,126)" fill-opacity="1" d=" M5.164999961853027,-4.586999893188477 C5.164999961853027,-4.586999893188477 -5.164999961853027,4.586999893188477 -5.164999961853027,4.586999893188477 C-5.164999961853027,4.586999893188477 -3.7899999618530273,4.315999984741211 -3.7899999618530273,4.315999984741211 C-3.7899999618530273,4.315999984741211 5.164999961853027,-4.586999893188477 5.164999961853027,-4.586999893188477z"></path></g></g><g style="display: none;"><g><path></path></g></g><g style="display: none;"><g><path></path></g></g><g style="display: none;"><g><path></path></g></g><g style="display: none;"><g><path></path></g></g><g style="display: none;"><g><path></path></g></g><g style="display: none;"><g><path></path></g></g></g></svg></div></div><!----> <div class="cover gem svelte-12ha7jh" bis_skin_checked="1"></div></button>""",
    "bombHTML": """<button class="tile mine svelte-12ha7jh" data-testid="mines-tile-18" data-revealed="false" style="--tile-shadow-inset: -0.15em; --shadow: 0.3em; --tile-shadow-lg: 0.44999999999999996em; --small-shadow: -0.15em; --duration: 300ms; --fetch-duration: 600ms;"><!----><!----><!----> <div class="mine svelte-sx409p" style="background-image: url(&quot;/_app/immutable/assets/mine.BrdEJX0T.svg&quot;); --duration: 300ms;" bis_skin_checked="1"></div><!----> <div class="cover mine svelte-12ha7jh" bis_skin_checked="1"></div></button>""",
    "clickedBombHTML": """<button class="tile mine svelte-12ha7jh" data-game-tile-status="mine" data-testid="mines-tile-18" data-revealed="true" style="--tile-shadow-inset: -0.15em; --shadow: 0.3em; --tile-shadow-lg: 0.44999999999999996em; --small-shadow: -0.15em; --duration: 300ms; --fetch-duration: 600ms;"><!----><!----><img alt="mine effect" class="effect svelte-sx409p" src="/_app/immutable/assets/mineEffect.CTwuSNug.gif"><!----> <div class="mine svelte-sx409p revealed" style="background-image: url(&quot;/_app/immutable/assets/mine.BrdEJX0T.svg&quot;); --duration: 300ms;"></div><!----> <div class="cover mine svelte-12ha7jh"></div></button>""",
    "normalHTML": """<button class="tile idle svelte-12ha7jh" data-testid="mines-tile-0" data-revealed="false" style="--tile-shadow-inset: -0.15em; --shadow: 0.3em; --tile-shadow-lg: 0.44999999999999996em; --small-shadow: -0.15em; --duration: 300ms; --fetch-duration: 600ms;"><!----><!----> <div class="cover idle svelte-12ha7jh" bis_skin_checked="1"></div></button>""",
    "resultDivHTML": """<div class="game-result-wrap win svelte-1g8uakg" style="--duration: 180ms; --modal-width: 150px; --modal-height: 132px; --win-modal-heading-color: var(--color-grey-200); z-index: 65 !important; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" bis_skin_checked="1"><div class="game-result-content svelte-1g8uakg" bis_skin_checked="1"><span class="number-multiplier svelte-1g8uakg" style="--truncate-max-width: 118px;"><span tag="span" type="body" strong="true" size="md" class="ds-body-md-strong" data-ds-text="true">24.75×</span></span><div class="divider svelte-1g8uakg" bis_skin_checked="1"></div><span class="payout-result win svelte-1g8uakg"><div role="presentation" class="inline-flex items-center gap-1 max-w-full text-center svelte-1jb7pu8" bis_skin_checked="1"><span class="content svelte-1jb7pu8" style="max-width: 98px;"><span tag="span" type="body" class="text-neutral-subtle ds-body-md-strong text-center" size="md" strong="true" variant="neutral-subtle" data-ds-text="true" style="max-width: 98px;">$0.00</span></span><span tag="span" type="body" title="ltc" size="md" class="ds-body-md inline-flex" data-ds-text="true"><svg data-ds-icon="LTC" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" class="inline-block shrink-0"><path fill="#3C649B" d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11"></path><path fill="#fff" d="m8.167 14.21-.98.382.475-1.905.99-.398L10.085 6.5h3.524l-1.031 4.26.969-.393-.468 1.89-.983.393-.58 2.406h5.297L16.21 17.5H7.359z"></path></svg></span></div></span></div></div>"""
}

# JSON file lock for thread safety
json_file_lock = threading.Lock()

# JSON file management functions
def read_json_file(filename):
    """Read data from a JSON file, always returns a list"""
    try:
        with json_file_lock:
            if os.path.exists(filename):
                # Check if file is empty
                if os.path.getsize(filename) == 0:
                    return []
                
                with open(filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Ensure data is a list, not a string or other type
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict):
                    # If it's a dict, convert to list (shouldn't happen but handle it)
                    logger.warning(f"{filename} contains a dict instead of list, converting...")
                    return [data]
                elif isinstance(data, str):
                    # If it's a string, return empty list and log error
                    logger.error(f"{filename} contains a string instead of list: {data[:100]}")
                    return []
                else:
                    logger.warning(f"{filename} contains unexpected type {type(data)}, returning empty list")
                    return []
            return []
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {filename}: {e}")
        # Try to backup corrupted file
        try:
            backup_name = f"{filename}.backup"
            if os.path.exists(filename):
                import shutil
                shutil.copy2(filename, backup_name)
                logger.info(f"Backed up corrupted {filename} to {backup_name}")
        except:
            pass
        return []
    except Exception as e:
        logger.error(f"Error reading {filename}: {e}")
        return []

def write_json_file(filename, data):
    """Write data to a JSON file"""
    try:
        with json_file_lock:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
    except Exception as e:
        logger.error(f"Error writing {filename}: {e}")
        return False

def find_in_json_list(data_list, key_field, value):
    """Find an item in a list of dictionaries by key field"""
    if not isinstance(data_list, list):
        return None
    for item in data_list:
        if isinstance(item, dict) and item.get(key_field) == value:
            return item
    return None

def update_json_item(filename, key_field, key_value, updates):
    """Update an item in a JSON file"""
    data = read_json_file(filename)
    item = find_in_json_list(data, key_field, key_value)
    if item:
        item.update(updates)
        return write_json_file(filename, data)
    return False

def delete_json_item(filename, key_field, key_value):
    """Delete an item from a JSON file"""
    data = read_json_file(filename)
    if not isinstance(data, list):
        logger.warning(f"{filename} data is not a list in delete_json_item")
        return False
    data = [item for item in data if isinstance(item, dict) and item.get(key_field) != key_value]
    return write_json_file(filename, data)

def add_json_item(filename, item):
    """Add an item to a JSON file"""
    data = read_json_file(filename)
    # Ensure data is a list
    if not isinstance(data, list):
        logger.warning(f"{filename} data is not a list, initializing as empty list")
        data = []
    
    # Check if item already exists (by id)
    if 'id' in item:
        existing = find_in_json_list(data, 'id', item['id'])
        if existing:
            return False
    data.append(item)
    return write_json_file(filename, data)

def create_admin_session():
    try:
        token = generate_session_id()
        ADMIN_SESSIONS[token] = datetime.now(timezone.utc)
        return token
    except Exception as e:
        logger.error(f"Error creating admin session: {e}")
        return None

def is_valid_admin_token(token):
    try:
        if not token:
            return False
        created_at = ADMIN_SESSIONS.get(token)
        if not created_at:
            return False
        now = datetime.now(timezone.utc)
        if (now - created_at).total_seconds() > ADMIN_SESSION_TTL_SECONDS:
            ADMIN_SESSIONS.pop(token, None)
            return False
        return True
    except Exception as e:
        logger.error(f"Error validating admin token: {e}")
        return False

def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("X-Admin-Token")
        if not is_valid_admin_token(token):
            return jsonify({
                "status": "error",
                "message": "Admin authorization required"
            }), 403
        return f(*args, **kwargs)
    return wrapper

def ensure_json_file_exists(filename):
    """Ensure JSON file exists and is properly formatted as an empty array"""
    try:
        if not os.path.exists(filename):
            write_json_file(filename, [])
        else:
            # Verify file contains valid JSON array
            data = read_json_file(filename)
            if not isinstance(data, list):
                logger.warning(f"{filename} is corrupted, reinitializing...")
                write_json_file(filename, [])
    except Exception as e:
        logger.error(f"Error ensuring {filename} exists: {e}")
        try:
            write_json_file(filename, [])
        except:
            pass

def get_user_by_email(email, users_data=None):
    try:
        if users_data is None:
            users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            return None, None, []
        for index, user in enumerate(users_data):
            if isinstance(user, dict) and user.get("email") == email:
                return user, index, users_data
        return None, None, users_data
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        return None, None, []

def get_user_by_token(token, users_data=None):
    try:
        if users_data is None:
            users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            return None, None, []
        for index, user in enumerate(users_data):
            if isinstance(user, dict) and user.get("user_token") == token:
                return user, index, users_data
        return None, None, users_data
    except Exception as e:
        logger.error(f"Error getting user by token: {e}")
        return None, None, []

def send_verification_email(to_email, code):
    try:
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            logger.error("SMTP credentials not configured")
            return False
        html = f"""
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SoulAI - Welcome to the Future of Predictions</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                background-color: #000000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #ffffff;
                line-height: 1.6;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #3DF604;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                color: #3DF604;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }}
            .tagline {{
                color: #aaa;
                font-size: 16px;
            }}
            .content {{
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
            }}
            .welcome-title {{
                font-size: 28px;
                color: #ffffff;
                margin-bottom: 15px;
                font-weight: 700;
            }}
            .description {{
                color: #ccc;
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.7;
            }}
            .code-container {{
                background: #000;
                border-radius: 12px;
                padding: 30px;
                margin: 30px 0;
                border: 2px solid #3DF604;
                box-shadow: 0 0 20px rgba(61, 246, 4, 0.2);
            }}
            .verification-code {{
                font-size: 36px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #3DF604;
                text-shadow: 0 0 10px rgba(61, 246, 4, 0.5);
            }}
            .code-label {{
                color: #aaa;
                font-size: 14px;
                margin-top: 10px;
                display: block;
            }}
            .instructions {{
                background: rgba(61, 246, 4, 0.1);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                border-left: 4px solid #3DF604;
            }}
            .instruction-item {{
                color: #ddd;
                font-size: 14px;
                margin: 10px 0;
                display: flex;
                align-items: center;
            }}
            .icon {{
                color: #3DF604;
                margin-right: 10px;
                font-weight: bold;
            }}
            .footer {{
                margin-top: 40px;
                text-align: center;
                color: #777;
                font-size: 12px;
                padding-top: 20px;
                border-top: 1px solid #333;
            }}
            .security-note {{
                color: #ff6b6b;
                font-style: italic;
                margin-top: 20px;
                font-size: 12px;
            }}
            @media (max-width: 600px) {{
                .container {{
                    padding: 20px 10px;
                }}
                .content {{
                    padding: 25px;
                }}
                .verification-code {{
                    font-size: 28px;
                    letter-spacing: 5px;
                }}
            }}
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
                <div class="logo">SOULAI</div>
                <div class="tagline">AI-Powered Prediction Systems</div>
            </div>
            <div class="content">
                <h1 class="welcome-title">Welcome to SoulAI!</h1>
                <p class="description">Thank you for joining our exclusive community. Use the verification code below to activate your account and unlock premium predictive analytics.</p>
                
                <div class="code-container">
                    <div class="verification-code">{code}</div>
                    <span class="code-label">YOUR VERIFICATION CODE</span>
                </div>
                
                <div class="instructions">
                    <div class="instruction-item"><span class="icon">✓</span> Enter this code in the verification field</div>
                    <div class="instruction-item"><span class="icon">✓</span> Code is valid for 10 minutes only</div>
                    <div class="instruction-item"><span class="icon">✓</span> Access premium features immediately</div>
                </div>
                
                <p class="security-note">Never share this code with anyone. SoulAI will never ask for your verification code.</p>
            </div>
            
            <div class="footer">
                <p>You received this email because you signed up for SoulAI services.</p>
                <p>If you didn't sign up, please ignore this email.</p>
                <p>© 2026 SoulAI. All rights reserved.</p>
            </div>
        </div>
        </body>
        </html>
        """
        msg = MIMEText(html, "html")
        msg["Subject"] = "SoulAI Email Verification Code"
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Error sending verification email: {e}")
        return False

# Function to retry database operations (kept for compatibility, but not used for keys)
def retry_operation(operation, max_retries=3, delay=1):
    """Retry an operation with exponential backoff"""
    retries = 0
    while retries < max_retries:
        try:
            result = operation()
            return result
        except Exception as e:
            retries += 1
            if retries == max_retries:
                raise e
            logger.error(f"Operation failed (attempt {retries}/{max_retries}): {e}")
            sleep(delay * (2 ** (retries - 1)))  # Exponential backoff

def is_key_invalid(key):
    """Check if a key is in the invalid_keys JSON file."""
    try:
        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        return find_in_json_list(invalid_keys, 'id', key) is not None
    except Exception as e:
        logger.error(f"Error checking if key is invalid: {e}")
        return False

def invalidate_key(key):
    """Move a key from active keys to invalid keys JSON file."""
    try:
        # Get the key data from active keys
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
        
        if not key_data:
            # Check timed keys
            timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
            key_data = find_in_json_list(timed_keys, 'id', key)
            if key_data:
                # Remove from timed keys
                delete_json_item(TIMED_KEYS_JSON_FILE, 'id', key)
        else:
            # Remove from active keys
            delete_json_item(KEYS_JSON_FILE, 'id', key)
        
        if not key_data:
            return False
        
        # Add to invalid keys
        invalid_key_data = {
            'id': key,
            **key_data,
            'invalidated_at': datetime.now(timezone.utc).isoformat()
        }
        return add_json_item(INVALID_KEYS_JSON_FILE, invalid_key_data)
            
    except Exception as e:
        logger.error(f"Error invalidating key: {e}")
        return False

def get_all_keys():
    """Get all active keys from JSON file."""
    try:
        keys = read_json_file(KEYS_JSON_FILE)
        return [item['id'] for item in keys if not item.get('device_id')]
    except Exception as e:
        logger.error(f"Error getting all keys: {e}")
        return []

def add_key(key):
    """Add a new key to the active keys JSON file."""
    try:
        # Check if key exists
        keys = read_json_file(KEYS_JSON_FILE)
        if find_in_json_list(keys, 'id', key):
            return False
            
        # Add key
        new_key = {
            'id': key,
            'device_id': None,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        return add_json_item(KEYS_JSON_FILE, new_key)
    except Exception as e:
        logger.error(f"Error adding key: {e}")
        return False

def bind_key_to_device(key, device_id):
    """Bind a key to a specific device ID."""
    try:
        # Check if key exists in regular keys
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
        
        if not key_data:
            return False
            
        # Update key
        updates = {
            'device_id': device_id,
            'bound_at': datetime.now(timezone.utc).isoformat()
        }
        return update_json_item(KEYS_JSON_FILE, 'id', key, updates)
    except Exception as e:
        logger.error(f"Error binding key to device: {e}")
        return False

def get_key_info(key):
    """Get information about a specific key."""
    try:
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
        if key_data:
            return key_data
        
        # Check timed keys
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        key_data = find_in_json_list(timed_keys, 'id', key)
        if key_data:
            return key_data
            
        return None
    except Exception as e:
        logger.error(f"Error getting key info: {e}")
        return None

app = Flask(__name__)
CORS(app)

# Initialize JSON files on startup
logger.info("Initializing JSON key and access storage files...")
ensure_json_file_exists(KEYS_JSON_FILE)
ensure_json_file_exists(TIMED_KEYS_JSON_FILE)
ensure_json_file_exists(INVALID_KEYS_JSON_FILE)
ensure_json_file_exists(SESSIONS_JSON_FILE)
ensure_json_file_exists(ACCESS_REQUESTS_JSON_FILE)
logger.info("JSON key and access storage files initialized")

# Add these variables for LTC price tracking
price_lock = threading.Lock()
ltc_price = None
last_update = 0
cache_duration = 300  # 5 minutes cache

DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1328323767973449831/TmWiHsnkgEXoQwDIQiIqzP-G_RPqpcFKoi-g6P0u-jV3UQdxPgsSNs4JueErceYV5jRA"
KEYS_FILE = "keys.txt"

# Key management Available keys
USED_KEYS = {}  # Format: {key: {"device_id": device_id, "timestamp": timestamp}}
INVALID_KEYS = set()  # For storing invalidated keys

def get_system_info():
    """Get detailed system information"""
    try:
        info = {
            "os": platform.system(),
            "os_version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": platform.node()
        }
        return info
    except:
        return {"error": "Could not fetch system info"}

def get_browser_info(request):
    """Get browser and request information"""
    return {
        "user_agent": request.headers.get("User-Agent", "Unknown"),
        "accept_language": request.headers.get("Accept-Language", "Unknown"),
        "accept_encoding": request.headers.get("Accept-Encoding", "Unknown")
    }

def get_detailed_ip_info():
    """
    Get detailed IP information using multiple free APIs for accuracy
    Returns merged data from multiple sources
    """
    headers_to_check = [
        'CF-Connecting-IP',
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Client-IP',
        'X-Forwarded',
        'Forwarded-For',
        'Forwarded',
        'X-Cluster-Client-IP',
        'True-Client-IP'
    ]

    def get_real_ip():
        """Get real IP by checking multiple headers"""
        for header in headers_to_check:
            if header in request.headers:
                # Split for X-Forwarded-For like headers that may contain multiple IPs
                ips = request.headers[header].split(',')
                # Return the first IP (original client IP) after stripping whitespace
                return ips[0].strip()

        return request.remote_addr

    def get_ip_info_ipapi(ip):
        """Get IP info from ip-api.com"""
        try:
            url = f"http://ip-api.com/json/{ip}?fields=status,message,continent,country,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    def get_ip_info_ipwhois(ip):
        """Get IP info from ipwhois.app"""
        try:
            url = f"https://ipwho.is/{ip}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    def get_ip_info_abstractapi(ip):
        """Get IP info from abstractapi.com"""
        try:
            url = f"https://ipgeolocation.abstractapi.com/v1/?ip_address={ip}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except:
            return None

    # Get the real IP address
    ip = get_real_ip()

    # Collect data from multiple sources
    ip_api_data = get_ip_info_ipapi(ip) or {}
    ipwhois_data = get_ip_info_ipwhois(ip) or {}
    abstractapi_data = get_ip_info_abstractapi(ip) or {}

    # Merge and validate data
    merged_data = {
        "ip": ip,
        "country": ip_api_data.get("country") or ipwhois_data.get("country") or abstractapi_data.get("country") or "Unknown",
        "country_code": ip_api_data.get("countryCode") or ipwhois_data.get("country_code") or abstractapi_data.get("country_code") or "Unknown",
        "region": ip_api_data.get("regionName") or ipwhois_data.get("region") or abstractapi_data.get("region") or "Unknown",
        "city": ip_api_data.get("city") or ipwhois_data.get("city") or abstractapi_data.get("city") or "Unknown",
        "zip": ip_api_data.get("zip") or ipwhois_data.get("postal") or abstractapi_data.get("postal_code") or "Unknown",
        "latitude": ip_api_data.get("lat") or ipwhois_data.get("latitude") or abstractapi_data.get("latitude") or 0,
        "longitude": ip_api_data.get("lon") or ipwhois_data.get("longitude") or abstractapi_data.get("longitude") or 0,
        "timezone": ip_api_data.get("timezone") or ipwhois_data.get("timezone") or abstractapi_data.get("timezone") or "Unknown",
        "isp": ip_api_data.get("isp") or ipwhois_data.get("connection", {}).get("isp") or abstractapi_data.get("connection", {}).get("isp_name") or "Unknown",
        "org": ip_api_data.get("org") or ipwhois_data.get("connection", {}).get("org") or abstractapi_data.get("connection", {}).get("organization_name") or "Unknown",
        "as": ip_api_data.get("as") or ipwhois_data.get("connection", {}).get("asn") or abstractapi_data.get("connection", {}).get("autonomous_system_number") or "Unknown",
        "proxy": any([
            ip_api_data.get("proxy", False),
            ipwhois_data.get("security", {}).get("proxy", False),
            abstractapi_data.get("security", {}).get("is_proxy", False)
        ]),
        "vpn": any([
            ip_api_data.get("hosting", False),
            ipwhois_data.get("security", {}).get("vpn", False),
            abstractapi_data.get("security", {}).get("is_vpn", False)
        ]),
        "tor": any([
            ipwhois_data.get("security", {}).get("tor", False),
            abstractapi_data.get("security", {}).get("is_tor", False)
        ]),
        "mobile": any([
            ip_api_data.get("mobile", False),
            ipwhois_data.get("connection", {}).get("is_mobile", False),
            abstractapi_data.get("connection", {}).get("is_mobile", False)
        ]),
        "hosting": any([
            ip_api_data.get("hosting", False),
            ipwhois_data.get("security", {}).get("hosting", False),
            abstractapi_data.get("security", {}).get("is_datacenter", False)
        ])
    }

    return merged_data


def get_time_remaining(expiry_date):
    try:
        now = datetime.now(timezone.utc)
        expiry = convert_to_utc(expiry_date)
        if expiry is None:
            return None

        time_left = expiry - now

        if time_left.total_seconds() <= 0:
            return "Expired"

        days = time_left.days
        hours = time_left.seconds // 3600
        minutes = (time_left.seconds % 3600) // 60

        if days > 0:
            return f"{days} days {hours} hours remaining"
        elif hours > 0:
            return f"{hours} hours {minutes} minutes remaining"
        else:
            return f"{minutes} minutes remaining"
    except Exception as e:
        logger.error(f"Error calculating time remaining: {e}")
        return None


def has_active_access(device_id):
    try:
        now = datetime.now(timezone.utc)
        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            return None

        active_request = None
        for req in requests_data:
            if not isinstance(req, dict):
                continue
            if req.get("device_id") != device_id:
                continue
            if req.get("status") != "approved":
                continue
            expiry_str = req.get("expires_at")
            if not expiry_str:
                continue
            expiry = convert_to_utc(expiry_str)
            if not expiry or expiry < now:
                continue
            if not active_request or convert_to_utc(active_request.get("expires_at")) < expiry:
                active_request = req

        return active_request
    except Exception as e:
        logger.error(f"Error checking active access: {e}")
        return None


def get_latest_request_by_username(username, data=None):
    try:
        if data is None:
            data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(data, list):
            return None, None, []

        latest = None
        latest_index = None
        latest_ts = None

        for idx, r in enumerate(data):
            if not isinstance(r, dict):
                continue
            identifier = r.get("username") or r.get("email")
            if identifier != username:
                continue
            ts = r.get("updated_at") or r.get("created_at") or ""
            if latest is None or (isinstance(ts, str) and ts > (latest_ts or "")):
                latest = r
                latest_index = idx
                latest_ts = ts

        return latest, latest_index, data
    except Exception as e:
        logger.error(f"Error getting latest request by username: {e}")
        return None, None, []


def _reset_daily_limit_fields(record):
    if not isinstance(record, dict):
        return False
    fields = [
        "web_mines_demo_count",
        "web_crash_demo_count",
        "web_blackjack_demo_count",
        "telegram_demo_count"
    ]
    changed = False
    for field in fields:
        current = record.get(field)
        if current not in (None, 0, "0"):
            changed = True
        record[field] = 0
    if changed:
        record["daily_limits_reset_at"] = datetime.now(timezone.utc).isoformat()
    return changed


def _read_json_raw(filename, default_value):
    try:
        with json_file_lock:
            if not os.path.exists(filename):
                return default_value
            if os.path.getsize(filename) == 0:
                return default_value
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        return default_value


def _write_json_raw(filename, data):
    try:
        with json_file_lock:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False


def _reset_bot_demo_plan_fields(plan_info):
    if not isinstance(plan_info, dict):
        return False
    plan_type = str(plan_info.get('plan') or '').strip().lower()
    if plan_type not in ('demo', 'free', 'trial'):
        return False
    changed = False
    for field in (
        'predictions_today_total',
        'predictions_today_mines',
        'predictions_today_crash',
        'predictions_today_blackjack',
        'predictions_today_moles',
        'predictions_today'
    ):
        current = plan_info.get(field)
        if current not in (None, 0, "0"):
            changed = True
        plan_info[field] = 0
    now = datetime.now().isoformat()
    plan_info['limit_window_started_at'] = now
    plan_info['last_prediction_date'] = datetime.now().date().isoformat()
    plan_info['daily_limits_reset_at'] = datetime.now(timezone.utc).isoformat()
    return True if changed else True


def _reset_bot_limits_in_users_json_by_email(email):
    users_data = _read_json_raw(USERS_JSON_FILE, {})
    changed = False
    matched = 0

    if isinstance(users_data, dict):
        for user_id, user in users_data.items():
            if not isinstance(user, dict):
                continue
            user_email = str(user.get('email') or '').strip().lower()
            username_email = str(user.get('username') or '').strip().lower()
            if user_email == email or username_email == email:
                matched += 1
                plan_info = user.get('plan')
                if _reset_bot_demo_plan_fields(plan_info):
                    user['plan'] = plan_info
                    users_data[user_id] = user
                    changed = True
    elif isinstance(users_data, list):
        for idx, user in enumerate(users_data):
            if not isinstance(user, dict):
                continue
            user_email = str(user.get('email') or '').strip().lower()
            username_email = str(user.get('username') or '').strip().lower()
            if user_email == email or username_email == email:
                matched += 1
                plan_info = user.get('plan')
                if _reset_bot_demo_plan_fields(plan_info):
                    user['plan'] = plan_info
                    users_data[idx] = user
                    changed = True

    if changed:
        if not _write_json_raw(USERS_JSON_FILE, users_data):
            return False, matched, changed
    return True, matched, changed


def _reset_bot_limits_in_users_json_for_all():
    users_data = _read_json_raw(USERS_JSON_FILE, {})
    changed = False
    updated = 0

    if isinstance(users_data, dict):
        for user_id, user in users_data.items():
            if not isinstance(user, dict):
                continue
            plan_info = user.get('plan')
            if _reset_bot_demo_plan_fields(plan_info):
                user['plan'] = plan_info
                users_data[user_id] = user
                changed = True
                updated += 1
    elif isinstance(users_data, list):
        for idx, user in enumerate(users_data):
            if not isinstance(user, dict):
                continue
            plan_info = user.get('plan')
            if _reset_bot_demo_plan_fields(plan_info):
                user['plan'] = plan_info
                users_data[idx] = user
                changed = True
                updated += 1

    if changed:
        if not _write_json_raw(USERS_JSON_FILE, users_data):
            return False, updated
    return True, updated

def send_to_discord(key_data):
    """Send enhanced monitoring data with detailed IP info to Discord webhook"""
    try:
        ip_info = get_detailed_ip_info()

        fields = [
            {"name": "Key Information", "value": f"Key: {key_data['key']}\nStatus: {key_data.get('status', 'Unknown')}", "inline": False},
            {"name": "Device ID", "value": key_data['device_id'], "inline": True},
            {"name": "IP Information", "value": (
                f"IP: {ip_info['ip']}\n"
                f"Country: {ip_info['country']} ({ip_info['country_code']})\n"
                f"Region: {ip_info['region']}\n"
                f"City: {ip_info['city']}\n"
                f"ZIP: {ip_info['zip']}"
            ), "inline": False},
            {"name": "Connection Details", "value": (
                f"ISP: {ip_info['isp']}\n"
                f"Organization: {ip_info['org']}\n"
                f"AS: {ip_info['as']}"
            ), "inline": False},
            {"name": "Security Checks", "value": (
                f"Proxy: {ip_info['proxy']}\n"
                f"VPN: {ip_info['vpn']}\n"
                f"TOR: {ip_info['tor']}\n"
                f"Hosting/Datacenter: {ip_info['hosting']}\n"
                f"Mobile Connection: {ip_info['mobile']}"
            ), "inline": False},
            {"name": "Location", "value": (
                f"Latitude: {ip_info['latitude']}\n"
                f"Longitude: {ip_info['longitude']}\n"
                f"Timezone: {ip_info['timezone']}"
            ), "inline": False},
            {"name": "System Info", "value": f"OS: {key_data.get('system', {}).get('os', 'Unknown')}\nVersion: {key_data.get('system', {}).get('os_version', 'Unknown')}", "inline": False},
            {"name": "Browser", "value": key_data.get('browser', {}).get('user_agent', 'Unknown'), "inline": False},
            {"name": "Time", "value": key_data["timestamp"], "inline": True}
        ]

        embed = {
            "title": "🔑 Key Usage Alert",
            "color": 5814783,
            "fields": fields,
            "footer": {"text": "Enhanced IP Tracking System"}
        }

        payload = {
            "embeds": [embed]
        }

        requests.post(DISCORD_WEBHOOK_URL, json=payload)
    except Exception as e:
        print(f"Error sending to Discord: {e}")

def get_location_info(ip):
    """Get country information from IP address"""
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}")
        data = response.json()
        return data.get("country", "Unknown")
    except:
        return "Unknown"

@app.route("/code")
def serve_text():
    # Serve the raw text with the correct content type
    return Response(TEXT_CONTENT, mimetype="text/plain")

ltc_price = None
usd_price = None
usd_inr_price = None
last_update_ltc = 0
last_update_usd = 0
last_update_usd_inr = 0
last_update = 0
cache_duration = 60  # seconds
price_lock = threading.Lock()



def fetch_usd_price():
    try:
        response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=usd')
        data = response.json()
        return data['usd']['usd']
    except Exception as e:
        print(f"Error fetching USD price: {e}")
        return None


def fetch_usd_inr_price():
    try:
        response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=inr')
        data = response.json()
        return data['usd']['inr']
    except Exception as e:
        print(f"Error fetching USD to INR price: {e}")
        return None


def fetch_ltc_price():
    try:
        apis = [
            {
                'url': 'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd',
                'handler': lambda r: r.json()['litecoin']['usd'] if r.status_code == 200 else None
            },
            {
                'url': 'https://api.binance.com/api/v3/ticker/price?symbol=LTCUSDT',
                'handler': lambda r: float(r.json()['price']) if r.status_code == 200 else None
            },
            {
                'url': 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=LTC-USDT',
                'handler': lambda r: float(r.json()['data']['price']) if r.status_code == 200 else None
            }
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
        }

        for api in apis:
            try:
                response = requests.get(api['url'], headers=headers, timeout=10)
                price = api['handler'](response)
                if price is not None:
                    print(f"Successfully fetched price from {api['url']}: {price}")
                    return price
            except Exception as e:
                print(f"Error with {api['url']}: {str(e)}")
                continue

        return None
    except Exception as e:
        print(f"Error in fetch_ltc_price: {str(e)}")
        return None


@app.route('/get_ltc_price', methods=['GET'])
def get_ltc_price():
    global ltc_price, last_update_ltc
    current_time = time.time()

    try:
        with price_lock:
            if ltc_price is None or (current_time - last_update_ltc) > cache_duration:
                new_price = fetch_ltc_price()
                if new_price is not None:
                    ltc_price = new_price
                    last_update_ltc = current_time
                elif ltc_price is not None:
                    return jsonify({'success': True, 'price': ltc_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch LTC price'}), 500

            return jsonify({'success': True, 'price': ltc_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500


@app.route('/get_usd_price', methods=['GET'])
def get_usd_price():
    global usd_price, last_update_usd
    current_time = time.time()

    try:
        with price_lock:
            if usd_price is None or (current_time - last_update_usd) > cache_duration:
                new_price = fetch_usd_price()
                if new_price is not None:
                    usd_price = new_price
                    last_update_usd = current_time
                elif usd_price is not None:
                    return jsonify({'success': True, 'price': usd_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch USD price'}), 500

            return jsonify({'success': True, 'price': usd_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500


@app.route('/get_usd_inr_price', methods=['GET'])
def get_usd_inr_price():
    global usd_inr_price, last_update_usd_inr
    current_time = time.time()

    try:
        with price_lock:
            if usd_inr_price is None or (current_time - last_update_usd_inr) > cache_duration:
                new_price = fetch_usd_inr_price()
                if new_price is not None:
                    usd_inr_price = new_price
                    last_update_usd_inr = current_time
                elif usd_inr_price is not None:
                    return jsonify({'success': True, 'price': usd_inr_price, 'cached': True})
                else:
                    return jsonify({'success': False, 'error': 'Failed to fetch USD-INR price'}), 500

            return jsonify({'success': True, 'price': usd_inr_price, 'cached': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,X-Device-ID')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
            
        key = data.get('activation_key')
        if not key:
            return jsonify({
                "status": "error",
                "message": "Key required"
            }), 400
            
        device_id = request.headers.get('X-Device-ID')
        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device identifier required"
            }), 400

        # Check if key exists in any JSON file
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
            
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        timed_key_data = find_in_json_list(timed_keys, 'id', key)
            
        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_key_data = find_in_json_list(invalid_keys, 'id', key)

        # Check if key is invalidated
        if invalid_key_data:
            return jsonify({
                "status": "error",
                "message": "This key has been invalidated"
            }), 401

        # Check regular keys first
        if key_data:
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
                    
                # Create session for existing device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Login successful"
                })
            else:
                # First time verification - bind the key to this device
                update_json_item(KEYS_JSON_FILE, 'id', key, {
                    'device_id': device_id,
                    'activated_at': datetime.now(timezone.utc).isoformat()
                })
                    
                # Create session for new device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully"
                })
                
        # Check timed keys
        elif timed_key_data:
            key_data = timed_key_data
            expiry = convert_to_utc(key_data.get('expiry'))
            
            if expiry is None:
                return jsonify({
                    "status": "error",
                    "message": "Invalid expiry date format"
                }), 500
            
            # Check if key has expired
            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "This timed key has expired"
                }), 401
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
                    
                # Create session for existing device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Login successful"
                })
            else:
                # First time verification - bind the key to this device
                update_json_item(TIMED_KEYS_JSON_FILE, 'id', key, {
                    'device_id': device_id,
                    'activated_at': datetime.now(timezone.utc).isoformat()
                })
                    
                # Create session for new device
                session_id = create_session(key, device_id)
                if not session_id:
                    return jsonify({
                        "status": "error",
                        "message": "Failed to create session"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully"
                })
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid key"
            }), 401
        
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/invalidate-key', methods=['POST'])
@require_admin
def invalidate_key_route():
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                "status": "error",
                "message": "No key provided"
            }), 400
        
        key = data['key']
        
        # Check all JSON files for the key
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
            
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        timed_key_data = find_in_json_list(timed_keys, 'id', key)
            
        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_key_data = find_in_json_list(invalid_keys, 'id', key)
            
        # Check if already invalidated
        if invalid_key_data:
            return jsonify({
                "status": "error",
                "message": "Key is already invalid"
            }), 400
            
        # Handle regular key
        if key_data:
            # Add to invalid keys
            invalid_key_entry = {
                'id': key,
                'invalidated_at': datetime.now(timezone.utc).isoformat(),
                'previous_data': key_data
            }
            add_json_item(INVALID_KEYS_JSON_FILE, invalid_key_entry)
            
            # Remove from active keys
            delete_json_item(KEYS_JSON_FILE, 'id', key)
                
            return jsonify({
                "status": "success",
                "message": "Key invalidated successfully"
            })
            
        # Handle timed key
        elif timed_key_data:
            # Add to invalid keys
            invalid_key_entry = {
                'id': key,
                'invalidated_at': datetime.now(timezone.utc).isoformat(),
                'previous_data': timed_key_data
            }
            add_json_item(INVALID_KEYS_JSON_FILE, invalid_key_entry)
            
            # Remove from timed keys
            delete_json_item(TIMED_KEYS_JSON_FILE, 'id', key)
                
            return jsonify({
                "status": "success",
                "message": "Timed key invalidated successfully"
            })
            
        return jsonify({
            "status": "error",
            "message": "Key not found"
        }), 404
        
    except Exception as e:
        logger.error(f"Error in invalidate_key: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def convert_to_utc(dt_str):
    """Convert datetime string to UTC datetime object"""
    try:
        # Remove Z and add UTC timezone
        dt = datetime.fromisoformat(dt_str.replace('Z', ''))
        if dt.tzinfo is None:
            # If datetime is naive, assume it's in UTC
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception as e:
        logger.error(f"Error converting datetime: {e}")
        return None

def calculate_expiration_date(start_date, duration, unit):
    """Calculate expiration date based on duration and unit"""
    if unit == 'm':
        return start_date + timedelta(minutes=duration)
    elif unit == 'h':
        return start_date + timedelta(hours=duration)
    elif unit == 'd':
        return start_date + timedelta(days=duration)
    else:
        # Default to days if invalid unit
        return start_date + timedelta(days=duration)

@app.route('/get-analytics', methods=['GET'])
@require_admin
def get_analytics():
    try:
        # Get all keys from different JSON files
        active_keys_data = read_json_file(KEYS_JSON_FILE)
        timed_keys_data = read_json_file(TIMED_KEYS_JSON_FILE)
        invalid_keys_data = read_json_file(INVALID_KEYS_JSON_FILE)
        
        # Ensure all are lists
        if not isinstance(active_keys_data, list):
            logger.warning(f"{KEYS_JSON_FILE} is not a list, reinitializing")
            active_keys_data = []
            ensure_json_file_exists(KEYS_JSON_FILE)
        if not isinstance(timed_keys_data, list):
            logger.warning(f"{TIMED_KEYS_JSON_FILE} is not a list, reinitializing")
            timed_keys_data = []
            ensure_json_file_exists(TIMED_KEYS_JSON_FILE)
        if not isinstance(invalid_keys_data, list):
            logger.warning(f"{INVALID_KEYS_JSON_FILE} is not a list, reinitializing")
            invalid_keys_data = []
            ensure_json_file_exists(INVALID_KEYS_JSON_FILE)
        
        # Calculate statistics
        total_keys = len(active_keys_data) + len(timed_keys_data) + len(invalid_keys_data)
        
        # Count bound and unused keys
        bound_keys = 0
        unused_keys = 0
        
        # Count from regular keys
        for key in active_keys_data:
            if isinstance(key, dict) and key.get('device_id'):
                bound_keys += 1
            elif isinstance(key, dict):
                unused_keys += 1
                
        # Count from timed keys
        now = datetime.now(timezone.utc)
        for key in timed_keys_data:
            if isinstance(key, dict):
                expiry = convert_to_utc(key.get('expiry'))
                if expiry and expiry > now:  # Only count non-expired keys
                    if key.get('device_id'):
                        bound_keys += 1
                    else:
                        unused_keys += 1
                
        return jsonify({
            'status': 'success',
            'data': {
                'total_keys': total_keys,
                'bound_keys': bound_keys,
                'unused_keys': unused_keys,
                'invalidated_keys': len(invalid_keys_data)
            }
        })
    except Exception as e:
        logger.error(f"Error in get_analytics: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-invalid-keys', methods=['GET'])
@require_admin
def get_invalid_keys():
    try:
        invalid_keys_data = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_keys = [item['id'] for item in invalid_keys_data]
            
        return jsonify({
            'status': 'success',
            'keys': invalid_keys
        })
    except Exception as e:
        logger.error(f"Error in get_invalid_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-bound-keys', methods=['GET'])
@require_admin
def get_bound_keys():
    try:
        keys = read_json_file(KEYS_JSON_FILE)
        bound_keys = [item['id'] for item in keys if item.get('device_id')]
            
        return jsonify({
            'status': 'success',
            'keys': bound_keys
        })
    except Exception as e:
        logger.error(f"Error in get_bound_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-timed-keys', methods=['GET'])
@require_admin
def get_timed_keys():
    try:
        # Get all timed keys
        timed_keys_data = read_json_file(TIMED_KEYS_JSON_FILE)
        
        keys = []
        expired_keys = []
        now = datetime.now(timezone.utc)
        
        for item in timed_keys_data:
            key_id = item['id']
            expiry = convert_to_utc(item.get('expiry'))
            
            if expiry is None:
                continue
                
            # Check if key is expired
            if expiry < now:
                expired_keys.append(key_id)
            else:
                keys.append({
                    'id': key_id,
                    'expiry': item.get('expiry'),
                    'device_id': item.get('device_id')
                })
        
        # Remove expired keys
        if expired_keys:
            for key in expired_keys:
                delete_json_item(TIMED_KEYS_JSON_FILE, 'id', key)
        
        return jsonify({
            'status': 'success',
            'keys': keys
        })
        
    except Exception as e:
        logger.error(f"Error in get_timed_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def get_time_remaining(expiry_date):
    """Calculate remaining time in human readable format"""
    try:
        now = datetime.now(timezone.utc)
        expiry = convert_to_utc(expiry_date)
        if expiry is None:
            return None
            
        time_left = expiry - now
        
        # If expired
        if time_left.total_seconds() <= 0:
            return "Expired"
            
        days = time_left.days
        hours = time_left.seconds // 3600
        minutes = (time_left.seconds % 3600) // 60
        
        if days > 0:
            return f"{days} days {hours} hours remaining"
        elif hours > 0:
            return f"{hours} hours {minutes} minutes remaining"
        else:
            return f"{minutes} minutes remaining"
    except Exception as e:
        logger.error(f"Error calculating time remaining: {e}")
        return None

@app.route('/check-key-status', methods=['POST'])
@require_admin
def check_key_status():
    try:
        data = request.get_json() or {}
        key = data.get('key')

        if not key:
            return jsonify({
                'status': 'error',
                'message': 'No key provided'
            }), 400

        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        timed_key_data = find_in_json_list(timed_keys, 'id', key)

        if timed_key_data:
            key_data = timed_key_data
            expiry = convert_to_utc(key_data.get('expiry'))
            time_remaining = get_time_remaining(key_data.get('expiry'))

            if expiry is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid expiry date format'
                }), 500

            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    'status': 'success',
                    'key_status': 'expired',
                    'message': 'This timed key has expired',
                    'expiry': key_data['expiry'],
                    'time_remaining': 'Expired',
                    'is_timed': True
                })

            if key_data.get('device_id'):
                return jsonify({
                    'status': 'success',
                    'key_status': 'bound',
                    'message': f'This timed key is bound to a device ({time_remaining})',
                    'expiry': key_data['expiry'],
                    'time_remaining': time_remaining,
                    'device_id': key_data['device_id'],
                    'is_timed': True
                })

            return jsonify({
                'status': 'success',
                'key_status': 'unused',
                'message': f'This is an unused timed key ({time_remaining})',
                'expiry': key_data['expiry'],
                'time_remaining': time_remaining,
                'is_timed': True
            })

        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_key_data = find_in_json_list(invalid_keys, 'id', key)

        if invalid_key_data:
            return jsonify({
                'status': 'success',
                'key_status': 'invalid',
                'message': 'This key has been invalidated',
                'is_timed': False
            })

        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)

        if key_data:
            if key_data.get('device_id'):
                return jsonify({
                    'status': 'success',
                    'key_status': 'bound',
                    'message': 'This key is bound to a device',
                    'is_timed': False
                })
            else:
                return jsonify({
                    'status': 'success',
                    'key_status': 'unused',
                    'message': 'This key is unused and valid',
                    'is_timed': False
                })

        return jsonify({
            'status': 'success',
            'key_status': 'not_found',
            'message': 'This key does not exist',
            'is_timed': False
        })

    except Exception as e:
        logger.error(f"Error in check_key_status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/request-access', methods=['POST'])
def request_access():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        device_id = request.headers.get('X-Device-ID')

        if not device_id:
            return jsonify({
                'status': 'error',
                'message': 'Device ID required'
            }), 400

        if not email or '@' not in str(email):
            return jsonify({
                'status': 'error',
                'message': 'Valid email required'
            }), 400

        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user, _, _ = get_user_by_email(email, users_data)
        if not user or not user.get('verified'):
            return jsonify({
                'status': 'error',
                'message': 'Email not registered. Please complete email verification first.'
            }), 403

        system_info = get_system_info()
        browser_info = get_browser_info(request)
        ip_info = get_detailed_ip_info()

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        existing = None
        for req in requests_data:
            if isinstance(req, dict) and req.get('device_id') == device_id:
                existing = req
                break

        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        approved_template, _, _ = get_latest_request_by_username(email, requests_data)
        can_auto_approve = False
        approved_expires_at = None
        approved_approved_at = None
        if approved_template and approved_template.get('status') == 'approved':
            expiry_str = approved_template.get('expires_at')
            if expiry_str:
                try:
                    expiry_dt = convert_to_utc(expiry_str)
                except Exception:
                    expiry_dt = None
                if expiry_dt and expiry_dt > now:
                    can_auto_approve = True
                    approved_expires_at = expiry_str
                    approved_approved_at = approved_template.get('approved_at') or now_iso

        target = existing
        if existing:
            existing.update({
                "email": email,
                "username": existing.get("username") or email,
                "system": system_info,
                "browser": browser_info,
                "ip_info": ip_info,
                "updated_at": now_iso,
                "status": existing.get("status", "pending")
            })
        else:
            request_id = generate_session_id()
            new_request = {
                "id": request_id,
                "device_id": device_id,
                "email": email,
                "username": email,
                "created_at": now_iso,
                "updated_at": now_iso,
                "status": "pending",
                "system": system_info,
                "browser": browser_info,
                "ip_info": ip_info
            }
            requests_data.append(new_request)
            target = new_request

        if can_auto_approve and target:
            target['status'] = 'approved'
            target['approved_at'] = approved_approved_at
            target['expires_at'] = approved_expires_at

        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "message": "Access request submitted",
            "device_id": device_id
        })
    except Exception as e:
        logger.error(f"Error in request_access: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/access-requests', methods=['GET'])
@require_admin
def get_access_requests():
    try:
        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        return jsonify({
            "status": "success",
            "requests": requests_data
        })
    except Exception as e:
        logger.error(f"Error in get_access_requests: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/approve-access', methods=['POST'])
@require_admin
def approve_access():
    try:
        data = request.get_json() or {}
        request_id = data.get('request_id')
        email = data.get('email')
        duration = data.get('duration')
        unit = data.get('unit')

        if (not request_id and not email) or duration is None or not unit:
            return jsonify({
                "status": "error",
                "message": "request_id, duration and unit are required"
            }), 400

        try:
            duration = int(duration)
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Duration must be an integer"
            }), 400

        if duration <= 0:
            return jsonify({
                "status": "error",
                "message": "Duration must be positive"
            }), 400

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        target = None
        if request_id:
            for req in requests_data:
                if isinstance(req, dict) and req.get('id') == request_id:
                    target = req
                    break

        if not target and email:
            existing, _, _ = get_latest_request_by_username(email, requests_data)
            if existing:
                target = existing
            else:
                now_iso = datetime.now(timezone.utc).isoformat()
                new_request = {
                    "id": generate_session_id(),
                    "device_id": None,
                    "email": email,
                    "username": email,
                    "created_at": now_iso,
                    "updated_at": now_iso,
                    "status": "pending"
                }
                requests_data.append(new_request)
                target = new_request

        if not target:
            return jsonify({
                "status": "error",
                "message": "Access request not found"
            }), 404

        now = datetime.now(timezone.utc)
        expiry = now
        if unit == 'm':
            expiry += timedelta(minutes=duration)
        elif unit == 'h':
            expiry += timedelta(hours=duration)
        elif unit == 'd':
            expiry += timedelta(days=duration)
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid time unit. Use m, h, or d."
            }), 400

        target['status'] = 'approved'
        target['approved_at'] = now.isoformat()
        target['expires_at'] = expiry.isoformat()

        time_requests = target.get('time_requests')
        if isinstance(time_requests, list):
            for tr in time_requests:
                if isinstance(tr, dict) and tr.get('status') == 'pending':
                    tr['status'] = 'approved'
                    tr['resolved_at'] = now.isoformat()

        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "message": "Access approved",
            "request": target
        })
    except Exception as e:
        logger.error(f"Error in approve_access: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/revoke-access', methods=['POST'])
@require_admin
def revoke_access():
    try:
        data = request.get_json() or {}
        request_id = data.get('request_id')
        email = data.get('email')

        if not request_id and not email:
            return jsonify({
                "status": "error",
                "message": "request_id or email is required"
            }), 400

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        target = None
        if request_id:
            for req in requests_data:
                if isinstance(req, dict) and req.get('id') == request_id:
                    target = req
                    break

        if not target and email:
            existing, _, _ = get_latest_request_by_username(email, requests_data)
            if existing:
                target = existing

        if not target:
            return jsonify({
                "status": "error",
                "message": "Access request not found"
            }), 404

        target['status'] = 'revoked'
        target['revoked_at'] = datetime.now(timezone.utc).isoformat()

        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "message": "Access revoked",
            "request": target
        })
    except Exception as e:
        logger.error(f"Error in revoke_access: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/check-access', methods=['POST'])
def check_access():
    try:
        device_id = request.headers.get('X-Device-ID')
        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device ID required",
                "approved": False
            }), 400

        active = has_active_access(device_id)
        if not active:
            return jsonify({
                "status": "success",
                "approved": False
            })

        time_remaining = get_time_remaining(active.get('expires_at'))

        return jsonify({
            "status": "success",
            "approved": True,
            "username": active.get('username'),
            "expires_at": active.get('expires_at'),
            "time_remaining": time_remaining
        })
    except Exception as e:
        logger.error(f"Error in check_access: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "approved": False
        }), 500


@app.route('/admin-login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json() or {}
        credential = data.get('credential')

        if not credential:
            return jsonify({
                "status": "error",
                "message": "Credential required"
            }), 400

        if credential != ADMIN_CREDENTIAL:
            return jsonify({
                "status": "error",
                "message": "Invalid admin credential"
            }), 401

        token = create_admin_session()
        if not token:
            return jsonify({
                "status": "error",
                "message": "Unable to create admin session"
            }), 500

        return jsonify({
            "status": "success",
            "token": token
        })
    except Exception as e:
        logger.error(f"Error in admin_login: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/user-login', methods=['POST'])
def user_login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or data.get('username') or '').strip().lower()
        password = data.get('password')
        user_token = data.get('user_token')
        
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email required"
            }), 400
            
        if not password and not user_token:
            return jsonify({
                "status": "error",
                "message": "Password or user token required"
            }), 400
            
        # Require user to be registered - no login for unregistered users
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user_row, _, _ = get_user_by_email(email, users_data)
        if not user_row:
            return jsonify({
                "status": "error",
                "message": "User not registered. Please register first."
            }), 403
            
        # Authenticate via user_token if password not provided
        if not password and user_token:
            if user_row.get('user_token') != user_token:
                return jsonify({
                    "status": "error",
                    "message": "Invalid session token."
                }), 403
        else:
            if not user_row.get('password'):
                return jsonify({
                    "status": "error",
                    "message": "Account created via OTP. Please use Forgot Password to set a password."
                }), 403
                
            if not check_password_hash(user_row.get('password'), password):
                return jsonify({
                    "status": "error",
                    "message": "Invalid password."
                }), 403
        record, index, requests_data = get_latest_request_by_username(email)
        if not record:
            try:
                requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
                if not isinstance(requests_data, list):
                    requests_data = []
            except Exception:
                requests_data = []
            now_iso = datetime.now(timezone.utc).isoformat()
            record = {
                "id": generate_session_id(),
                "username": email,
                "email": email,
                "status": "pending",
                "created_at": now_iso,
                "updated_at": now_iso,
                "mines_access_enabled": False,
                "crash_access_enabled": False,
                "blackjack_access_enabled": False,
                "moles_access_enabled": False,
                "mines_logins_count": 0,
                "mines_predictions_count": 0,
                "crash_logins_count": 0,
                "crash_predictions_count": 0,
                "blackjack_logins_count": 0,
                "blackjack_predictions_count": 0
            }
            requests_data.append(record)
            index = len(requests_data) - 1

        if not record:
            return jsonify({
                "status": "error",
                "message": "No access record found for this username"
            }), 404

        now_iso = datetime.now(timezone.utc).isoformat()
        record['last_web_login_at'] = now_iso
        login_count = record.get('fake_mines_login_count') or 0
        try:
            login_count = int(login_count)
        except Exception:
            login_count = 0
        record['fake_mines_login_count'] = login_count + 1
        
        # Initialize new access fields if they don't exist
        if 'mines_access_enabled' not in record:
            record['mines_access_enabled'] = False
        if 'crash_access_enabled' not in record:
            record['crash_access_enabled'] = False
        if 'blackjack_access_enabled' not in record:
            record['blackjack_access_enabled'] = False
        if 'moles_access_enabled' not in record:
            record['moles_access_enabled'] = False
        if 'mines_logins_count' not in record:
            record['mines_logins_count'] = 0
        if 'mines_predictions_count' not in record:
            record['mines_predictions_count'] = 0
        if 'crash_logins_count' not in record:
            record['crash_logins_count'] = 0
        if 'crash_predictions_count' not in record:
            record['crash_predictions_count'] = 0
        if 'blackjack_logins_count' not in record:
            record['blackjack_logins_count'] = 0
        if 'blackjack_predictions_count' not in record:
            record['blackjack_predictions_count'] = 0
        
        # Update mines login count
        mines_login_count = record.get('mines_logins_count') or 0
        try:
            mines_login_count = int(mines_login_count)
        except Exception:
            mines_login_count = 0
        record['mines_logins_count'] = mines_login_count + 1
        record['mines_last_used_at'] = now_iso

        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        expires_at = record.get('expires_at')
        expiry_dt = convert_to_utc(expires_at) if expires_at else None
        active = record.get('status') == 'approved' and expiry_dt and expiry_dt > datetime.now(timezone.utc)
        time_remaining = get_time_remaining(expires_at) if expires_at else None

        mines_expires_at = record.get('mines_expires_at')
        crash_expires_at = record.get('crash_expires_at')
        blackjack_expires_at = record.get('blackjack_expires_at')
        moles_expires_at = record.get('moles_expires_at')
        mines_time_remaining = get_time_remaining(mines_expires_at) if mines_expires_at else None
        crash_time_remaining = get_time_remaining(crash_expires_at) if crash_expires_at else None
        blackjack_time_remaining = get_time_remaining(blackjack_expires_at) if blackjack_expires_at else None
        moles_time_remaining = get_time_remaining(moles_expires_at) if moles_expires_at else None

        subscription_plan = None
        plan_expires_at = None
        plan_time_remaining = None
        plan_active = False
        total_paid_usd = 0

        try:
            ensure_json_file_exists(USERS_JSON_FILE)
            users_data = read_json_file(USERS_JSON_FILE)
            if not isinstance(users_data, list):
                users_data = []
            user_row, _, _ = get_user_by_email(email, users_data)
            if user_row:
                subscription_plan = user_row.get('subscription_plan')
                plan_expires_at = user_row.get('plan_expires_at')
                total_paid_usd = user_row.get('total_paid_usd') or 0
                if plan_expires_at:
                    try:
                        plan_expiry_dt = convert_to_utc(plan_expires_at)
                    except Exception:
                        plan_expiry_dt = None
                    if plan_expiry_dt and plan_expiry_dt > datetime.now(timezone.utc):
                        plan_active = True
                    plan_time_remaining = get_time_remaining(plan_expires_at)
        except Exception as e:
            logger.error(f"Error loading subscription plan for user_login: {e}")

        user_payload = {
            "username": record.get('username') or record.get('email'),
            "device_id": record.get('device_id'),
            "status": record.get('status'),
            "created_at": record.get('created_at'),
            "approved_at": record.get('approved_at'),
            "expires_at": expires_at,
            "active": bool(active),
            "time_remaining": time_remaining,
            "mines_expires_at": mines_expires_at,
            "mines_time_remaining": mines_time_remaining,
            "crash_expires_at": crash_expires_at,
            "crash_time_remaining": crash_time_remaining,
            "blackjack_expires_at": blackjack_expires_at,
            "blackjack_time_remaining": blackjack_time_remaining,
            "moles_expires_at": moles_expires_at,
            "moles_time_remaining": moles_time_remaining,
            "last_web_login_at": record.get('last_web_login_at'),
            "last_script_used_at": record.get('last_script_used_at'),
            "fake_mines_login_count": record.get('fake_mines_login_count') or 0,
            "script_usage_count": record.get('script_usage_count') or 0,
            "web_crash_demo_count": record.get('web_crash_demo_count') or 0,
            "web_mines_demo_count": record.get('web_mines_demo_count') or 0,
            "telegram_demo_count": record.get('telegram_demo_count') or 0,
            "telegram_premium_count": record.get('telegram_premium_count') or 0,
            "mines_access_enabled": record.get('mines_access_enabled', False),
            "crash_access_enabled": record.get('crash_access_enabled', False),
            "blackjack_access_enabled": record.get('blackjack_access_enabled', False),
            "moles_access_enabled": record.get('moles_access_enabled', False),
            "mines_logins_count": record.get('mines_logins_count') or 0,
            "mines_predictions_count": record.get('mines_predictions_count') or 0,
            "mines_last_used_at": record.get('mines_last_used_at'),
            "crash_logins_count": record.get('crash_logins_count') or 0,
            "crash_predictions_count": record.get('crash_predictions_count') or 0,
            "crash_last_used_at": record.get('crash_last_used_at'),
            "blackjack_logins_count": record.get('blackjack_logins_count') or 0,
            "blackjack_predictions_count": record.get('blackjack_predictions_count') or 0,
            "blackjack_last_used_at": record.get('blackjack_last_used_at'),
            "subscription_plan": subscription_plan,
            "subscription_plan_name": get_plan_display_name(subscription_plan or "free"),
            "plan_expires_at": plan_expires_at,
            "plan_time_remaining": plan_time_remaining,
            "plan_active": plan_active,
            "total_paid_usd": total_paid_usd
        }

        return jsonify({
            "status": "success",
            "user": user_payload
        })
    except Exception as e:
        logger.error(f"Error in user_login: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# User registration endpoint
@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        
        if not email or '@' not in str(email):
            return jsonify({
                "status": "error",
                "message": "Valid email required"
            }), 400
            
        if not password or len(password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters"
            }), 400
        
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        
        # Check if user already exists
        user, index, _ = get_user_by_email(email, users_data)
        if user:
            # If they don't have a password yet (legacy OTP account), allow them to set it here
            if not user.get('password'):
                user['password'] = generate_password_hash(password)
                user['updated_at'] = datetime.now(timezone.utc).isoformat()
                users_data[index] = user
                write_json_file(USERS_JSON_FILE, users_data)
                return jsonify({
                    "status": "success",
                    "message": "Password set successfully for legacy account."
                })
            else:
                return jsonify({
                    "status": "error",
                    "message": "User with this email already exists"
                }), 400
        
        # Create new user
        user_id = generate_session_id()
        now = datetime.now(timezone.utc)
        
        # Capture browser and device information
        browser_info = get_browser_info(request)
        ip_info = get_detailed_ip_info()
        
        new_user = {
            "id": user_id,
            "email": email,
            "password": generate_password_hash(password),
            "verified": True,
            "user_token": generate_session_id(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "last_registration_attempt": now.isoformat(),
            "browser_info": browser_info,
            "ip_info": ip_info,
            "registration_count": 1,
            "subscription_plan": "free",
            "plan_expires_at": None,
            "total_paid_usd": 0,
            "assets": [],
            "status": "active",
            "active": True
        }
        
        users_data.append(new_user)
        
        if not write_json_file(USERS_JSON_FILE, users_data):
            return jsonify({
                "status": "error",
                "message": "Unable to save user data"
            }), 500
        
        # Return success with user data
        payload = {
            "email": new_user.get('email'),
            "verified": new_user.get('verified'),
            "user_token": new_user.get('user_token'),
            "subscription_plan": new_user.get('subscription_plan'),
            "plan_expires_at": new_user.get('plan_expires_at'),
            "total_paid_usd": new_user.get('total_paid_usd') or 0,
            "assets": new_user.get('assets') or []
        }
        
        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "user": payload
        })
    except Exception as e:
        logger.error(f"Error in register_user: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/auth/forgot-password', methods=['POST'])
def auth_forgot_password():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        if not email or '@' not in str(email):
            return jsonify({
                "status": "error",
                "message": "Valid email required"
            }), 400
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        code = ''.join(random.choices('0123456789', k=6))
        code_hash = hashlib.sha256((email + code).encode('utf-8')).hexdigest()
        now = datetime.now(timezone.utc)
        expires_at = (now + timedelta(minutes=10)).isoformat()
        user, index, _ = get_user_by_email(email, users_data)
        
        # Capture browser and device information
        browser_info = get_browser_info(request)
        ip_info = get_detailed_ip_info()
        
        if user:
            # Update existing user with new browser info
            user['verification_code_hash'] = code_hash
            user['verification_expires_at'] = expires_at
            user['verified'] = False
            user['updated_at'] = now.isoformat()
            user['last_registration_attempt'] = now.isoformat()
            user['browser_info'] = browser_info
            user['ip_info'] = ip_info
            user['registration_count'] = user.get('registration_count', 0) + 1
            users_data[index] = user
        else:
            user_id = generate_session_id()
            user = {
                "id": user_id,
                "email": email,
                "verification_code_hash": code_hash,
                "verification_expires_at": expires_at,
                "verified": False,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "last_registration_attempt": now.isoformat(),
                "browser_info": browser_info,
                "ip_info": ip_info,
                "registration_count": 1,
                "subscription_plan": "free",
                "plan_expires_at": None,
                "total_paid_usd": 0,
                "assets": [],
                "status": "pending",  # Add status for admin panel
                "active": False
            }
            users_data.append(user)
        
        # Persist OTP state before sending email so verify step can read it.
        if not write_json_file(USERS_JSON_FILE, users_data):
            return jsonify({
                "status": "error",
                "message": "Unable to store verification code"
            }), 500

        # Send verification email
        sent = send_verification_email(email, code)
        if not sent:
            return jsonify({
                "status": "error",
                "message": "Unable to send verification email"
            }), 500
        
        return jsonify({
            "status": "success",
            "message": "Verification code sent",
            "user_id": user.get('id')  # Return user ID for tracking
        })
    except Exception as e:
        logger.error(f"Error in auth_request_code: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/users', methods=['GET'])
@require_admin
def admin_get_users():
    """Get all users for admin panel with merged access information"""
    try:
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []

        try:
            access_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
            if not isinstance(access_data, list):
                access_data = []
        except Exception:
            access_data = []

        access_by_email = {}
        for rec in access_data:
            if not isinstance(rec, dict):
                continue
            identifier = rec.get("username") or rec.get("email")
            if not identifier:
                continue
            latest = access_by_email.get(identifier)
            ts = rec.get("updated_at") or rec.get("created_at") or ""
            if latest is None or (isinstance(ts, str) and ts > (latest.get("_ts") or "")):
                temp = dict(rec)
                temp["_ts"] = ts
                access_by_email[identifier] = temp

        formatted_users = []
        for user in users_data:
            email = user.get("email", "")
            access_rec = access_by_email.get(email)
            predictor_requests = []
            time_requests = []
            if access_rec:
                pr = access_rec.get("predictor_access_requests") or []
                if isinstance(pr, list):
                    predictor_requests = pr
                tr = access_rec.get("time_requests") or []
                if isinstance(tr, list):
                    time_requests = tr

            formatted_user = {
                "id": user.get("id", ""),
                "email": email,
                "status": user.get("status", "unknown"),
                "verified": user.get("verified", False),
                "active": user.get("active", False),
                "created_at": user.get("created_at", ""),
                "updated_at": user.get("updated_at", ""),
                "verified_at": user.get("verified_at", ""),
                "last_registration_attempt": user.get("last_registration_attempt", ""),
                "registration_count": user.get("registration_count", 0),
                "subscription_plan": user.get("subscription_plan", None),
                "plan_expires_at": user.get("plan_expires_at", None),
                "total_paid_usd": user.get("total_paid_usd", 0),
                "browser_info": user.get("browser_info", {}),
                "ip_info": user.get("ip_info", {}),
                "access_request_id": (access_rec or {}).get("id"),
                "mines_access_enabled": (access_rec or {}).get("mines_access_enabled", False),
                "crash_access_enabled": (access_rec or {}).get("crash_access_enabled", False),
                "blackjack_access_enabled": (access_rec or {}).get("blackjack_access_enabled", False),
                "moles_access_enabled": (access_rec or {}).get("moles_access_enabled", False),
                "access_status": (access_rec or {}).get("status", "pending"),
                "access_created_at": (access_rec or {}).get("created_at"),
                "access_approved_at": (access_rec or {}).get("approved_at"),
                "access_expires_at": (access_rec or {}).get("expires_at"),
                "time_requests": time_requests,
                "predictor_access_requests": predictor_requests
            }
            formatted_users.append(formatted_user)

        formatted_users.sort(key=lambda x: x.get("last_registration_attempt", ""), reverse=True)

        return jsonify({
            "status": "success",
            "users": formatted_users,
            "total_count": len(formatted_users)
        })
    except Exception as e:
        logger.error(f"Error in admin_get_users: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/update-plan', methods=['POST'])
@require_admin
def admin_update_plan():
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id')
        email = data.get('email')
        plan = (data.get('subscription_plan') or '').strip().lower()
        duration = data.get('duration')
        unit = data.get('unit') or 'd'

        if not user_id and not email:
            return jsonify({
                "status": "error",
                "message": "User ID or email required"
            }), 400

        allowed_plans = {"free", "silver", "gold", "turbo"}
        if plan and plan not in allowed_plans:
            return jsonify({
                "status": "error",
                "message": "Invalid subscription_plan"
            }), 400

        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []

        idx = None
        user = None
        if user_id:
            for i, u in enumerate(users_data):
                if isinstance(u, dict) and u.get("id") == user_id:
                    idx = i
                    user = u
                    break
        elif email:
            for i, u in enumerate(users_data):
                if isinstance(u, dict) and u.get("email") == email:
                    idx = i
                    user = u
                    break

        if idx is None or user is None:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        now = datetime.now(timezone.utc)

        if not plan:
            user['subscription_plan'] = "free"
            user['plan_expires_at'] = None
        else:
            user['subscription_plan'] = plan
            expires_at = None
            try:
                if duration is not None:
                    duration_val = int(duration)
                    if duration_val > 0:
                        expires_at = calculate_expiration_date(now, duration_val, unit)
            except Exception:
                expires_at = None
            user['plan_expires_at'] = expires_at.isoformat() if expires_at else None

        user['updated_at'] = now.isoformat()
        users_data[idx] = user

        if not write_json_file(USERS_JSON_FILE, users_data):
            return jsonify({
                "status": "error",
                "message": "Unable to update user plan"
            }), 500

        payload = {
            "id": user.get("id"),
            "email": user.get("email"),
            "subscription_plan": user.get("subscription_plan"),
            "plan_expires_at": user.get("plan_expires_at")
        }

        return jsonify({
            "status": "success",
            "user": payload
        })
    except Exception as e:
        logger.error(f"Error in admin_update_plan: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/approve-user', methods=['POST'])
@require_admin
def admin_approve_user():
            """Approve a user for access"""
            try:
                data = request.get_json() or {}
                user_id = data.get('user_id')
                email = data.get('email')
                
                if not user_id and not email:
                    return jsonify({
                        "status": "error",
                        "message": "User ID or email required"
                    }), 400
                
                ensure_json_file_exists(USERS_JSON_FILE)
                users_data = read_json_file(USERS_JSON_FILE)
                
                if not isinstance(users_data, list):
                    users_data = []
                
                # Find user by ID or email
                user_index = None
                user = None
                
                if user_id:
                    for i, u in enumerate(users_data):
                        if isinstance(u, dict) and u.get("id") == user_id:
                            user_index = i
                            user = u
                            break
                elif email:
                    for i, u in enumerate(users_data):
                        if isinstance(u, dict) and u.get("email") == email:
                            user_index = i
                            user = u
                            break
                
                if user_index is None or user is None:
                    return jsonify({
                        "status": "error",
                        "message": "User not found"
                    }), 404
                
                # Update user status
                now = datetime.now(timezone.utc)
                user['status'] = "approved"
                user['active'] = True
                user['approved_at'] = now.isoformat()
                user['updated_at'] = now.isoformat()
                
                # Set default access if not specified
                if 'mines_access_enabled' not in user:
                    user['mines_access_enabled'] = True
                if 'crash_access_enabled' not in user:
                    user['crash_access_enabled'] = True
                
                users_data[user_index] = user
                
                if not write_json_file(USERS_JSON_FILE, users_data):
                    return jsonify({
                        "status": "error",
                        "message": "Unable to update user"
                    }), 500
                
                return jsonify({
                    "status": "success",
                    "message": "User approved successfully",
                    "user": {
                        "id": user.get("id"),
                        "email": user.get("email"),
                        "status": user.get("status"),
                        "active": user.get("active")
                    }
                })
                
            except Exception as e:
                logger.error(f"Error in admin_approve_user: {e}")
                return jsonify({
                    "status": "error",
                    "message": str(e)
                }), 500
        
        

@app.route('/admin/users/pending', methods=['GET'])
@require_admin
def admin_get_pending_users():
            """Get pending users for quick approval"""
            try:
                ensure_json_file_exists(USERS_JSON_FILE)
                users_data = read_json_file(USERS_JSON_FILE)
                
                if not isinstance(users_data, list):
                    users_data = []
                
                # Filter pending users (verified but not approved)
                pending_users = [
                    user for user in users_data 
                    if isinstance(user, dict) and 
                    user.get("verified") == True and 
                    user.get("status") in ["verified", "pending"]
                ]
                
                # Format for display
                formatted_users = []
                for user in pending_users:
                    formatted_user = {
                        "id": user.get("id", ""),
                        "email": user.get("email", ""),
                        "status": user.get("status", "unknown"),
                        "created_at": user.get("created_at", ""),
                        "verified_at": user.get("verified_at", ""),
                        "browser_info": user.get("browser_info", {}),
                        "registration_count": user.get("registration_count", 0)
                    }
                    formatted_users.append(formatted_user)
                
                # Sort by verification date
                formatted_users.sort(key=lambda x: x.get("verified_at", ""), reverse=True)
                
                return jsonify({
                    "status": "success",
                    "users": formatted_users,
                    "total_count": len(formatted_users)
                })
                
            except Exception as e:
                logger.error(f"Error in admin_get_pending_users: {e}")
                return jsonify({
                    "status": "error",
                    "message": str(e)
                }), 500


@app.route('/admin/user-stats', methods=['GET'])
@require_admin
def admin_get_user_stats():
    """Get statistics about users for admin dashboard"""
    try:
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        
        if not isinstance(users_data, list):
            users_data = []
        
        # Calculate statistics
        total_users = len(users_data)
        verified_users = len([u for u in users_data if isinstance(u, dict) and u.get("verified") == True])
        approved_users = len([u for u in users_data if isinstance(u, dict) and u.get("status") == "approved"])
        active_users = len([u for u in users_data if isinstance(u, dict) and u.get("active") == True])
        pending_users = len([u for u in users_data if isinstance(u, dict) and u.get("status") in ["verified", "pending"]])
        
        # Get recent registrations (last 24 hours)
        now = datetime.now(timezone.utc)
        twenty_four_hours_ago = now - timedelta(hours=24)
        recent_registrations = [
            u for u in users_data 
            if isinstance(u, dict) and 
            u.get("created_at") and 
            datetime.fromisoformat(u.get("created_at").replace('Z', '+00:00')) > twenty_four_hours_ago
        ]
        
        stats = {
            "total_users": total_users,
            "verified_users": verified_users,
            "approved_users": approved_users,
            "active_users": active_users,
            "pending_users": pending_users,
            "recent_registrations": len(recent_registrations),
            "recent_users": [
                {
                    "id": u.get("id", ""),
                    "email": u.get("email", ""),
                    "status": u.get("status", "unknown"),
                    "created_at": u.get("created_at", "")
                }
                for u in recent_registrations[:10]  # Last 10 recent registrations
            ]
        }
        
        return jsonify({
            "status": "success",
            "stats": stats
        })
    
    except Exception as e:
        logger.error(f"Error in admin_get_user_stats: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/reset-user-limits', methods=['POST'])
@require_admin
def admin_reset_user_limits():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email required"
            }), 400

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        changed = False
        matched = 0
        reset_marker_iso = datetime.now(timezone.utc).isoformat()
        for i, rec in enumerate(requests_data):
            if not isinstance(rec, dict):
                continue
            identifier = (rec.get("username") or rec.get("email") or "").strip().lower()
            rec_email = (rec.get("email") or "").strip().lower()
            if identifier == email or rec_email == email:
                matched += 1
                rec["bot_limits_reset_at"] = reset_marker_iso
                if _reset_daily_limit_fields(rec):
                    rec["updated_at"] = datetime.now(timezone.utc).isoformat()
                    changed = True
                requests_data[i] = rec

        users_ok, users_matched, users_changed = _reset_bot_limits_in_users_json_by_email(email)
        if not users_ok:
            return jsonify({
                "status": "error",
                "message": "Unable to reset bot limits in users.json"
            }), 500

        if matched == 0 and users_matched == 0:
            return jsonify({
                "status": "error",
                "message": "No user record found for this email"
            }), 404

        if changed:
            if not write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data):
                return jsonify({
                    "status": "error",
                    "message": "Unable to reset user limits"
                }), 500

        return jsonify({
            "status": "success",
            "message": "User daily limits reset",
            "email": email,
            "matched_records": matched,
            "users_json_matched": users_matched,
            "users_json_updated": users_changed,
            "bot_limits_reset_at": reset_marker_iso
        })
    except Exception as e:
        logger.error(f"Error in admin_reset_user_limits: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/reset-all-daily-limits', methods=['POST'])
@require_admin
def admin_reset_all_daily_limits():
    try:
        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        changed_count = 0
        reset_marker_iso = datetime.now(timezone.utc).isoformat()
        for i, rec in enumerate(requests_data):
            if not isinstance(rec, dict):
                continue
            rec["bot_limits_reset_at"] = reset_marker_iso
            if _reset_daily_limit_fields(rec):
                rec["updated_at"] = datetime.now(timezone.utc).isoformat()
                changed_count += 1
            requests_data[i] = rec

        if changed_count > 0:
            if not write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data):
                return jsonify({
                    "status": "error",
                    "message": "Unable to reset daily limits"
                }), 500

        users_ok, users_updated = _reset_bot_limits_in_users_json_for_all()
        if not users_ok:
            return jsonify({
                "status": "error",
                "message": "Unable to reset bot limits in users.json"
            }), 500

        return jsonify({
            "status": "success",
            "message": "Daily limits reset for all users",
            "updated_records": changed_count,
            "users_json_updated": users_updated,
            "bot_limits_reset_at": reset_marker_iso
        })
    except Exception as e:
        logger.error(f"Error in admin_reset_all_daily_limits: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/bot/limit-reset-status', methods=['POST'])
def bot_limit_reset_status():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email required"
            }), 400

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        latest_reset_at = None
        for rec in requests_data:
            if not isinstance(rec, dict):
                continue
            identifier = (rec.get("username") or rec.get("email") or "").strip().lower()
            rec_email = (rec.get("email") or "").strip().lower()
            if identifier != email and rec_email != email:
                continue
            marker = rec.get("bot_limits_reset_at")
            if not marker:
                continue
            if latest_reset_at is None or str(marker) > str(latest_reset_at):
                latest_reset_at = marker

        return jsonify({
            "status": "success",
            "email": email,
            "bot_limits_reset_at": latest_reset_at
        })
    except Exception as e:
        logger.error(f"Error in bot_limit_reset_status: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
        
        
        if not write_json_file(USERS_JSON_FILE, users_data):
            return jsonify({
                "status": "error",
                "message": "Unable to store verification code"
            }), 500
        
        sent = send_verification_email(email, code)
        if not sent:
            return jsonify({
                "status": "error",
                "message": "Unable to send verification email"
            }), 500
        
        return jsonify({
            "status": "success",
            "message": "Verification code sent",
            "user_id": user.get('id')  # Return user ID for tracking
        })
    except Exception as e:
        logger.error(f"Error in auth_request_code: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password required"
            }), 400
            
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user, index, _ = get_user_by_email(email, users_data)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 400
            
        if not user.get('password'):
            return jsonify({
                "status": "error",
                "message": "Account created via OTP. Please use Forgot Password to set a password."
            }), 400
            
        if not check_password_hash(user.get('password'), password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password."
            }), 400
            
        if not user.get('user_token'):
            user['user_token'] = generate_session_id()
            user['updated_at'] = datetime.now(timezone.utc).isoformat()
            users_data[index] = user
            write_json_file(USERS_JSON_FILE, users_data)
            
        payload = {
            "email": user.get('email'),
            "verified": user.get('verified'),
            "user_token": user.get('user_token'),
            "subscription_plan": user.get('subscription_plan'),
            "subscription_plan_name": get_plan_display_name(user.get('subscription_plan') or "free"),
            "plan_expires_at": user.get('plan_expires_at'),
            "total_paid_usd": user.get('total_paid_usd') or 0,
            "assets": user.get('assets') or []
        }
        return jsonify({
            "status": "success",
            "user": payload
        })
    except Exception as e:
        logger.error(f"Error in auth_verify_code: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/auth/reset-password', methods=['POST'])
def auth_reset_password():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        code = data.get('code')
        new_password = data.get('new_password')
        
        if not email or not code or not new_password:
            return jsonify({
                "status": "error",
                "message": "Email, code, and new password required"
            }), 400
            
        if len(new_password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters"
            }), 400
            
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user, index, _ = get_user_by_email(email, users_data)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid request"
            }), 400
            
        stored_hash = user.get('verification_code_hash')
        expires_at = user.get('verification_expires_at')
        if not stored_hash or not expires_at:
            return jsonify({
                "status": "error",
                "message": "No active password reset request"
            }), 400
            
        try:
            expiry_dt = convert_to_utc(expires_at)
            if expiry_dt < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "Verification code expired"
                }), 400
        except Exception:
            return jsonify({
                "status": "error",
                "message": "Invalid expiry date"
            }), 400
            
        code_hash = hashlib.sha256((email + code).encode('utf-8')).hexdigest()
        if code_hash != stored_hash:
            return jsonify({
                "status": "error",
                "message": "Invalid code"
            }), 400
            
        user['password'] = generate_password_hash(new_password)
        user['verification_code_hash'] = None
        user['verification_expires_at'] = None
        user['verified'] = True
        user['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        if not user.get('user_token'):
            user['user_token'] = generate_session_id()
            
        users_data[index] = user
        write_json_file(USERS_JSON_FILE, users_data)
        
        return jsonify({
            "status": "success",
            "message": "Password reset successfully"
        })
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/auth/profile', methods=['POST'])
def auth_profile():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        token = data.get('user_token')
        if not email and not token:
            return jsonify({
                "status": "error",
                "message": "Email or user_token required"
            }), 400
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        user = None
        if token:
            user, _, _ = get_user_by_token(token, users_data)
        if not user and email:
            user, _, _ = get_user_by_email(email, users_data)
        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404
        payload = {
            "email": user.get('email'),
            "verified": user.get('verified'),
            "user_token": user.get('user_token'),
            "subscription_plan": user.get('subscription_plan'),
            "subscription_plan_name": get_plan_display_name(user.get('subscription_plan') or "free"),
            "plan_expires_at": user.get('plan_expires_at'),
            "total_paid_usd": user.get('total_paid_usd') or 0,
            "assets": user.get('assets') or [],
            "created_at": user.get('created_at'),
            "updated_at": user.get('updated_at')
        }
        return jsonify({
            "status": "success",
            "user": payload
        })
    except Exception as e:
        logger.error(f"Error in auth_profile: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/script-usage', methods=['POST'])
def script_usage():
    try:
        data = request.get_json() or {}
        username = data.get('username')
        device_id = request.headers.get('X-Device-ID')

        if not device_id or not username:
            return jsonify({
                "status": "error",
                "message": "Username and Device ID required"
            }), 400

        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        now_iso = datetime.now(timezone.utc).isoformat()
        found = False

        for req in requests_data:
            if not isinstance(req, dict):
                continue
            if req.get('device_id') == device_id and req.get('username') == username:
                req['last_script_used_at'] = now_iso
                usage_count = req.get('script_usage_count') or 0
                try:
                    usage_count = int(usage_count)
                except Exception:
                    usage_count = 0
                req['script_usage_count'] = usage_count + 1
                found = True
                break

        if found:
            write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "updated": found
        })
    except Exception as e:
        logger.error(f"Error in script_usage: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/user-stats', methods=['POST'])
def user_stats():
    try:
        data = request.get_json() or {}
        username = data.get('username')

        if not username:
            return jsonify({
                "status": "error",
                "message": "Username required"
            }), 400

        ensure_json_file_exists(ACCESS_REQUESTS_JSON_FILE)
        requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(requests_data, list):
            requests_data = []

        matching_records = []
        for rec in requests_data:
            if not isinstance(rec, dict):
                continue
            identifier = rec.get("username") or rec.get("email")
            if identifier == username:
                matching_records.append(rec)

        if not matching_records:
            return jsonify({
                "status": "error",
                "message": "No access record found for this username"
            }), 404

        fields = [
            "fake_mines_login_count",
            "script_usage_count",
            "web_crash_demo_count",
            "web_mines_demo_count",
            "web_blackjack_demo_count",
            "telegram_demo_count",
            "telegram_premium_count",
            "mines_predictions_count",
            "crash_predictions_count",
            "blackjack_predictions_count",
        ]

        totals = {field: 0 for field in fields}

        for rec in matching_records:
            for field in fields:
                value = rec.get(field) or 0
                try:
                    value_int = int(value)
                except Exception:
                    value_int = 0
                totals[field] += value_int

        stats_payload = totals

        return jsonify({
            "status": "success",
            "stats": stats_payload
        })
    except Exception as e:
        logger.error(f"Error in user_stats: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/track-prediction', methods=['POST'])
def track_prediction():
    try:
        data = request.get_json() or {}
        username = data.get('username') or data.get('email')
        prediction_type = (data.get('type') or '').strip().lower()  # 'mines', 'crash', or 'blackjack'
        source = (data.get('source') or 'web').lower()  # 'web' or 'telegram'
        plan = (data.get('plan') or 'demo').lower()  # 'demo', 'silver', 'gold', 'turbo', 'pro'

        if not username or not prediction_type:
            return jsonify({
                "status": "error",
                "message": "Username and prediction type required"
            }), 400

        if prediction_type not in ('mines', 'crash', 'blackjack', 'moles'):
            return jsonify({
                "status": "error",
                "message": "Invalid prediction type"
            }), 400

        record, index, requests_data = get_latest_request_by_username(username)
        # Auto-create access record for stats when coming from telegram or web
        if not record and source in ('telegram', 'web'):
            try:
                if not isinstance(requests_data, list):
                    requests_data = read_json_file(ACCESS_REQUESTS_JSON_FILE) or []
                now_iso = datetime.now(timezone.utc).isoformat()
                record = {
                    "id": generate_session_id(),
                    "username": username,
                    "email": username,
                    "status": "pending",
                    "created_at": now_iso,
                    "updated_at": now_iso,
                    "mines_access_enabled": False,
                    "crash_access_enabled": False,
                    "blackjack_access_enabled": False,
                    "moles_access_enabled": False,
                    "mines_logins_count": 0,
                    "mines_predictions_count": 0,
                    "crash_logins_count": 0,
                    "crash_predictions_count": 0,
                    "blackjack_logins_count": 0,
                    "blackjack_predictions_count": 0,
                    "moles_predictions_count": 0,
                    "telegram_demo_count": 0,
                    "telegram_premium_count": 0,
                    "web_mines_demo_count": 0,
                    "web_crash_demo_count": 0,
                    "web_blackjack_demo_count": 0,
                }
                requests_data.append(record)
                index = len(requests_data) - 1
                write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)
            except Exception as e:
                logger.error(f"Error creating record for stats: {e}")
        if not record:
            return jsonify({
                "status": "error",
                "message": "No access record found for this username"
            }), 404

        # Update telegram demo/pro counts when source is telegram
        if source == 'telegram':
            tg_demo = record.get('telegram_demo_count') or 0
            tg_premium = record.get('telegram_premium_count') or 0
            try:
                tg_demo = int(tg_demo)
                tg_premium = int(tg_premium)
            except Exception:
                tg_demo = tg_premium = 0
            if plan == 'demo':
                record['telegram_demo_count'] = tg_demo + 1
            else:
                record['telegram_premium_count'] = tg_premium + 1

        # Update prediction count (global mines/crash counters)
        count_field = f"{prediction_type}_predictions_count"
        current_count = record.get(count_field) or 0
        try:
            current_count = int(current_count)
        except Exception:
            current_count = 0
        record[count_field] = current_count + 1

        # Track web demo usage separately for dashboard stats
        if source == 'web' and plan == 'demo':
            web_field = None
            if prediction_type == 'mines':
                web_field = 'web_mines_demo_count'
            elif prediction_type == 'crash':
                web_field = 'web_crash_demo_count'
            elif prediction_type == 'blackjack':
                web_field = 'web_blackjack_demo_count'
            if web_field:
                web_count = record.get(web_field) or 0
                try:
                    web_count = int(web_count)
                except Exception:
                    web_count = 0
                record[web_field] = web_count + 1
        
        # Update last prediction timestamp
        record['last_prediction_at'] = datetime.now(timezone.utc).isoformat()
        
        # Update last used timestamp for the specific predictor
        last_used_field = f"{prediction_type}_last_used_at"
        record[last_used_field] = datetime.now(timezone.utc).isoformat()
        
        # Save updated data
        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "message": f"Prediction tracked for {prediction_type}",
            "new_count": record[count_field]
        })
    except Exception as e:
        logger.error(f"Error in track_prediction: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/user-ticket', methods=['POST'])
def user_ticket():
    try:
        data = request.get_json() or {}
        username = data.get('username')
        subject = data.get('subject')
        message_text = data.get('message')
        client_info = data.get('client_info') or {}

        if not username or not subject or not message_text:
            return jsonify({
                "status": "error",
                "message": "Username, subject and message are required"
            }), 400

        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        now_iso = datetime.now(timezone.utc).isoformat()
        ticket_id = generate_session_id()

        if not isinstance(client_info, dict):
            client_info = {}
        if "ip" not in client_info:
            client_info["ip"] = request.remote_addr
        if "user_agent" not in client_info:
            client_info["user_agent"] = request.headers.get("User-Agent")
        if "accept_language" not in client_info:
            client_info["accept_language"] = request.headers.get("Accept-Language")

        ticket = {
            "id": ticket_id,
            "username": username,
            "subject": subject,
            "status": "open",
            "created_at": now_iso,
            "updated_at": now_iso,
            "client_info": client_info,
            "messages": [
                {
                    "sender": "user",
                    "text": message_text,
                    "created_at": now_iso
                }
            ]
        }

        tickets_data.append(ticket)
        write_json_file(TICKETS_JSON_FILE, tickets_data)

        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        logger.error(f"Error in user_ticket: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/user-tickets/<username>', methods=['GET'])
def user_tickets(username):
    try:
        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        user_tickets_list = [
            t for t in tickets_data
            if isinstance(t, dict) and t.get("username") == username
        ]

        return jsonify({
            "status": "success",
            "tickets": user_tickets_list
        })
    except Exception as e:
        logger.error(f"Error in user_tickets: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/tickets', methods=['GET'])
@require_admin
def tickets():
    try:
        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        sorted_tickets = sorted(
            [t for t in tickets_data if isinstance(t, dict)],
            key=lambda t: t.get("updated_at") or t.get("created_at") or "",
            reverse=True
        )

        return jsonify({
            "status": "success",
            "tickets": sorted_tickets
        })
    except Exception as e:
        logger.error(f"Error in tickets: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/ticket/<ticket_id>', methods=['GET'])
def ticket_detail(ticket_id):
    try:
        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        ticket = find_in_json_list(tickets_data, "id", ticket_id)
        if not ticket:
            return jsonify({
                "status": "error",
                "message": "Ticket not found"
            }), 404

        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        logger.error(f"Error in ticket_detail: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/ticket-reply', methods=['POST'])
@require_admin
def ticket_reply():
    try:
        data = request.get_json() or {}
        ticket_id = data.get('ticket_id')
        sender = data.get('sender')
        message_text = data.get('message')

        if not ticket_id or not sender or not message_text:
            return jsonify({
                "status": "error",
                "message": "ticket_id, sender and message are required"
            }), 400

        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        ticket = find_in_json_list(tickets_data, "id", ticket_id)
        if not ticket:
            return jsonify({
                "status": "error",
                "message": "Ticket not found"
            }), 404

        messages = ticket.get("messages")
        if not isinstance(messages, list):
            messages = []

        now_iso = datetime.now(timezone.utc).isoformat()
        messages.append({
            "sender": sender,
            "text": message_text,
            "created_at": now_iso
        })
        ticket["messages"] = messages
        ticket["updated_at"] = now_iso

        write_json_file(TICKETS_JSON_FILE, tickets_data)

        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        logger.error(f"Error in ticket_reply: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/user-ticket-reply', methods=['POST'])
def user_ticket_reply():
    try:
        data = request.get_json() or {}
        ticket_id = data.get('ticket_id')
        message_text = data.get('message')
        username = data.get('username')
        client_info = data.get('client_info') or {}

        if not ticket_id or not message_text:
            return jsonify({
                "status": "error",
                "message": "ticket_id and message are required"
            }), 400

        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        ticket = find_in_json_list(tickets_data, "id", ticket_id)
        if not ticket:
            return jsonify({
                "status": "error",
                "message": "Ticket not found"
            }), 404

        if username and ticket.get("username") and ticket.get("username") != username:
            return jsonify({
                "status": "error",
                "message": "Ticket does not belong to this user"
            }), 403

        if not isinstance(client_info, dict):
            client_info = {}
        if "ip" not in client_info:
            client_info["ip"] = request.remote_addr
        if "user_agent" not in client_info:
            client_info["user_agent"] = request.headers.get("User-Agent")
        if "accept_language" not in client_info:
            client_info["accept_language"] = request.headers.get("Accept-Language")

        messages = ticket.get("messages")
        if not isinstance(messages, list):
            messages = []

        now_iso = datetime.now(timezone.utc).isoformat()
        messages.append({
            "sender": "user",
            "text": message_text,
            "created_at": now_iso
        })
        ticket["messages"] = messages
        ticket["updated_at"] = now_iso
        if "client_info" not in ticket or not isinstance(ticket["client_info"], dict):
            ticket["client_info"] = client_info

        write_json_file(TICKETS_JSON_FILE, tickets_data)

        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        logger.error(f"Error in user_ticket_reply: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/ticket-status', methods=['POST'])
@require_admin
def ticket_status():
    try:
        data = request.get_json() or {}
        ticket_id = data.get('ticket_id')
        status = data.get('status')

        if not ticket_id or not status:
            return jsonify({
                "status": "error",
                "message": "ticket_id and status are required"
            }), 400

        if status not in ["open", "paused", "closed"]:
            return jsonify({
                "status": "error",
                "message": "Invalid status"
            }), 400

        tickets_data = read_json_file(TICKETS_JSON_FILE)
        if not isinstance(tickets_data, list):
            tickets_data = []

        ticket = find_in_json_list(tickets_data, "id", ticket_id)
        if not ticket:
            return jsonify({
                "status": "error",
                "message": "Ticket not found"
            }), 404

        ticket["status"] = status
        ticket["updated_at"] = datetime.now(timezone.utc).isoformat()

        write_json_file(TICKETS_JSON_FILE, tickets_data)

        return jsonify({
            "status": "success",
            "ticket": ticket
        })
    except Exception as e:
        logger.error(f"Error in ticket_status: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/request-more-time', methods=['POST'])
def request_more_time():
    try:
        data = request.get_json() or {}
        username = data.get('username')
        duration = data.get('duration')
        unit = data.get('unit')
        note = data.get('note')

        if not username or duration is None or not unit:
            return jsonify({
                "status": "error",
                "message": "Username, duration and unit are required"
            }), 400

        try:
            duration = int(duration)
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Duration must be an integer"
            }), 400

        if duration <= 0 or duration > 60:
            return jsonify({
                "status": "error",
                "message": "Duration must be between 1 and 60"
            }), 400

        if unit not in ['m', 'h', 'd']:
            return jsonify({
                "status": "error",
                "message": "Invalid unit. Use m, h, or d."
            }), 400

        record, index, requests_data = get_latest_request_by_username(username)
        if not record or index is None:
            return jsonify({
                "status": "error",
                "message": "No access record found for this username"
            }), 404

        time_requests = record.get('time_requests')
        if not isinstance(time_requests, list):
            time_requests = []

        time_request = {
            "id": generate_session_id(),
            "duration": duration,
            "unit": unit,
            "note": note,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        time_requests.append(time_request)
        record['time_requests'] = time_requests

        requests_data[index] = record
        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "request": time_request
        })
    except Exception as e:
        logger.error(f"Error in request_more_time: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/boost-validity', methods=['POST'])
@require_admin
def boost_validity():
    try:
        data = request.get_json()
        if not data or 'key' not in data or 'duration' not in data or 'unit' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        key = data['key']
        duration = int(data['duration'])
        unit = data['unit']

        # Get the key from timedKeys JSON file
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        key_data = find_in_json_list(timed_keys, 'id', key)
        
        if not key_data:
            return jsonify({
                'status': 'error',
                'message': 'This key is not a timed key'
            }), 404
        
        # Calculate additional time
        additional_seconds = 0
        if unit == 'm':
            additional_seconds = duration * 60
        elif unit == 'h':
            additional_seconds = duration * 3600
        elif unit == 'd':
            additional_seconds = duration * 86400

        # For expired keys, start from current time
        current_expiry = convert_to_utc(key_data['expiry'])
        now = datetime.now(timezone.utc)
        
        # If key is expired, use current time as base
        if current_expiry < now:
            new_expiry = now + timedelta(seconds=additional_seconds)
        else:
            new_expiry = current_expiry + timedelta(seconds=additional_seconds)

        # Update the key with new expiry
        update_json_item(TIMED_KEYS_JSON_FILE, 'id', key, {
            'expiry': new_expiry.isoformat()
        })

        return jsonify({
            'status': 'success',
            'message': 'Validity extended successfully',
            'new_expiry': new_expiry.isoformat(),
            'was_expired': current_expiry < now
        })

    except Exception as e:
        logger.error(f"Error in boost_validity: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate_timed_keys', methods=['POST'])
@require_admin
def generate_timed_keys():
    try:
        data = request.get_json()
        if not data or 'duration' not in data or 'unit' not in data or 'count' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        duration = int(data['duration'])
        unit = data['unit']
        count = int(data['count'])

        if count <= 0 or count > 10:
            return jsonify({
                'status': 'error',
                'message': 'Count must be between 1 and 10'
            }), 400

        # Calculate expiry time
        expiry = datetime.now(timezone.utc)
        if unit == 'm':
            expiry += timedelta(minutes=duration)
        elif unit == 'h':
            expiry += timedelta(hours=duration)
        elif unit == 'd':
            expiry += timedelta(days=duration)
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid time unit. Use m, h, or d.'
            }), 400

        # Get all existing timed keys
        existing_timed = read_json_file(TIMED_KEYS_JSON_FILE)
        if not isinstance(existing_timed, list):
            logger.warning(f"{TIMED_KEYS_JSON_FILE} is not a list, reinitializing")
            existing_timed = []
            ensure_json_file_exists(TIMED_KEYS_JSON_FILE)
        existing_timed_ids = set(key['id'] for key in existing_timed if isinstance(key, dict) and 'id' in key)

        # Get available keys from the keys JSON file that aren't already timed keys
        keys_data = read_json_file(KEYS_JSON_FILE)
        if not isinstance(keys_data, list):
            logger.warning(f"{KEYS_JSON_FILE} is not a list, reinitializing")
            keys_data = []
            ensure_json_file_exists(KEYS_JSON_FILE)
        available_keys = [key['id'] for key in keys_data if isinstance(key, dict) and 'id' in key and not key.get('device_id') and key['id'] not in existing_timed_ids]

        if len(available_keys) < count:
            return jsonify({
                'status': 'error',
                'message': f'Not enough available keys. Only {len(available_keys)} keys available.'
            }), 400

        # Convert to timed keys
        keys = []
        for key in available_keys[:count]:
            try:
                # Move key to timedKeys JSON file
                timed_key_entry = {
                    'id': key,
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'expiry': expiry.isoformat(),
                    'device_id': None
                }
                add_json_item(TIMED_KEYS_JSON_FILE, timed_key_entry)
                
                # Remove from regular keys JSON file
                delete_json_item(KEYS_JSON_FILE, 'id', key)
                    
                keys.append(key)
                    
            except Exception as e:
                logger.error(f"Error converting key {key} to timed key: {e}")
                continue

        return jsonify({
            'status': 'success',
            'message': f'{len(keys)} timed keys generated successfully',
            'keys': keys,
            'expiry': expiry.isoformat()
        })

    except Exception as e:
        logger.error(f"Error in generate_timed_keys: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get-all-keys', methods=['GET'])
@require_admin
def get_all_keys():
    """Get all keys from all tables with their status"""
    try:
        # Get keys from all JSON files
        active_keys_data = read_json_file(KEYS_JSON_FILE)
        timed_keys_data = read_json_file(TIMED_KEYS_JSON_FILE)
        invalid_keys_data = read_json_file(INVALID_KEYS_JSON_FILE)
        
        # Ensure all are lists
        if not isinstance(active_keys_data, list):
            logger.warning(f"{KEYS_JSON_FILE} is not a list, reinitializing")
            active_keys_data = []
            ensure_json_file_exists(KEYS_JSON_FILE)
        if not isinstance(timed_keys_data, list):
            logger.warning(f"{TIMED_KEYS_JSON_FILE} is not a list, reinitializing")
            timed_keys_data = []
            ensure_json_file_exists(TIMED_KEYS_JSON_FILE)
        if not isinstance(invalid_keys_data, list):
            logger.warning(f"{INVALID_KEYS_JSON_FILE} is not a list, reinitializing")
            invalid_keys_data = []
            ensure_json_file_exists(INVALID_KEYS_JSON_FILE)
            
        # Process keys
        all_keys = []
        
        # Add regular keys
        for key in active_keys_data:
            if isinstance(key, dict) and 'id' in key:
                all_keys.append({
                    'id': key['id'],
                    'type': 'regular',
                    'status': 'bound' if key.get('device_id') else 'unused',
                    'device_id': key.get('device_id'),
                    'created_at': key.get('created_at'),
                    'activated_at': key.get('activated_at')
                })
            
        # Add timed keys
        now = datetime.now(timezone.utc)
        for key in timed_keys_data:
            if isinstance(key, dict) and 'id' in key:
                expiry = convert_to_utc(key.get('expiry'))
                # Check if key is expired
                is_expired = expiry and expiry < now
                
                status = 'expired' if is_expired else ('bound' if key.get('device_id') else 'unused')
                
                all_keys.append({
                    'id': key['id'],
                    'type': 'timed',
                    'status': status,
                    'device_id': key.get('device_id'),
                    'created_at': key.get('created_at'),
                    'expiry': key.get('expiry'),
                    'activated_at': key.get('activated_at'),
                    'is_expired': is_expired
                })
            
        # Add invalid keys
        for key in invalid_keys_data:
            if isinstance(key, dict) and 'id' in key:
                all_keys.append({
                    'id': key['id'],
                    'type': 'invalid',
                    'status': 'invalidated',
                    'invalidated_at': key.get('invalidated_at'),
                    'previous_data': key.get('previous_data')
                })
            
        return jsonify({
            'status': 'success',
            'keys': all_keys
        })
        
    except Exception as e:
        logger.error(f"Error in get_all_keys: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/get-positions', methods=['GET'])
def get_positions():
    # Create a list of all possible positions (0-24)
    positions = list(range(25))

    # Randomly shuffle the positions
    random.shuffle(positions)

    # Take first 3 positions for diamonds
    diamond_positions = positions[:3]

    # All remaining positions will be bombs
    bomb_positions = positions[3:]

    return jsonify({
        "status": "success",
        "diamonds": diamond_positions,
        "bombs": bomb_positions
    })

@app.route('/generate_tiles', methods=['POST'])
def generate_tiles():
    data = request.json
    tile_count = data.get('tileCount', 0)

    if tile_count < 1 or tile_count > 12:
        return jsonify({"error": "Invalid tile count"}), 400

    positions = list(range(25))  # Change to 25 tiles
    random.shuffle(positions)
    selected_tiles = positions[:tile_count]

    return jsonify({
        "status": "success",
        "tiles": selected_tiles
    })


@app.route('/validate_seed', methods=['POST'])
def validate_seed():
    data = request.json
    seed = data.get('server_seed')
    original_seed = data.get('original_seed', '')  # Optional field to check for tampering

    # Basic validation
    if not seed or len(seed) != 64:
        return jsonify({"valid": False, "error": "Server seed must be exactly 64 characters long"}), 400

    # Check for hexadecimal format (only 0-9, a-f characters allowed)
    if not all(c in "0123456789abcdef" for c in seed.lower()):
        return jsonify({"valid": False, "error": "Server seed must contain only hexadecimal characters (0-9, a-f)"}), 400

    # Check for minimum number of letters and digits
    letters = sum(c.isalpha() for c in seed)
    digits = sum(c.isdigit() for c in seed)

    if letters < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 letters"}), 400

    if digits < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 digits"}), 400

    # Check distribution - ensure seed has a good mix throughout
    # Divide the seed into 4 parts and verify each part has both letters and digits
    chunk_size = len(seed) // 4
    for i in range(4):
        chunk = seed[i * chunk_size:(i + 1) * chunk_size]
        chunk_letters = sum(c.isalpha() for c in chunk)
        chunk_digits = sum(c.isdigit() for c in chunk)

        if chunk_letters < 3 or chunk_digits < 3:
            return jsonify({"valid": False, "error": "Server seed must have a good distribution of letters and digits throughout"}), 400

    # Check if first 10-12 characters have been modified (if original seed is provided)
    if original_seed and len(original_seed) == 64:
        if not original_seed.startswith(seed[:12]) and not seed.startswith(original_seed[:12]):
            return jsonify({"valid": False, "error": "Beginning of server seed appears to be tampered with"}), 400

    # Check for patterns that might indicate manipulation
    # Prevent simple substitutions like replacing start with common words/numbers
    common_substitutions = ["hello", "1234567890", "abcdefghij", "test", "admin"]
    for sub in common_substitutions:
        # Check if any common substitution exists at the beginning of the seed
        if any(seed.lower().startswith(sub[0:min(len(sub), j)] + seed[j:j+min(12-len(sub), len(sub))])
               for j in range(1, 12)):
            return jsonify({"valid": False, "error": "Server seed contains suspicious patterns"}), 400

    # Check for entropy - no long sequences of the same character
    for i in range(len(seed) - 4):
        if len(set(seed[i:i+5])) <= 2:  # If 5 consecutive chars have 2 or fewer unique chars
            return jsonify({"valid": False, "error": "Server seed must have sufficient randomness"}), 400

    # Analyze the sample seeds to extract more validation rules
    # Looking at the samples, they all have good distribution of hex characters

    # Successful validation
    return jsonify({
        "valid": True,
        "message": "Server seed is valid",
        "analysis": {
            "length": len(seed),
            "letters": letters,
            "digits": digits,
            "hex_format": "valid"
        }
    }), 200


@app.route('/generate_pattern', methods=['POST'])
def generate_pattern():
    data = request.json
    accuracy = data.get('accuracy', 'stable')
    # Generate pattern based on accuracy
    positions = list(range(25))
    random.shuffle(positions)

    if accuracy == "60":
        diamond_count = random.randint(8, 10)
    elif accuracy == "95":
        diamond_count = random.randint(3, 4)
    elif accuracy == "stable":
        diamond_count = random.randint(1, 2)
    else:
        diamond_count = 1

    diamonds = positions[:diamond_count]
    bombs = positions[diamond_count:]

    return jsonify({
        "status": "success",
        "diamonds": diamonds,
        "bombs": bombs
    })


@app.route('/getpat', methods=['POST'])
def getpat():
    try:
        data = request.json
        server_seed = data.get('server_seed')
        mines_count = int(data.get('mines', 1))

        if not server_seed:
            return jsonify({'error': 'Server seed is required'}), 400

        # Set random seed using server seed and current time
        random.seed(server_seed + str(time.time()))

        # Generate all possible positions and shuffle them
        positions = list(range(25))
        random.shuffle(positions)

        # Determine gem count based on mines count
        if mines_count == 1:
            gem_count = random.randint(6, 10)
        elif mines_count == 2:
            gem_count = random.randint(2, 6)
        elif mines_count == 3:
            gem_count = random.randint(2, 4)
        elif mines_count == 4:
            gem_count = random.randint(1, 4)
        elif mines_count in (5, 6):
            gem_count = random.randint(2, 3)
        else:
            gem_count = random.randint(1, 3)

        # Split positions into gems and bombs
        gems = positions[:gem_count]
        bombs = positions[gem_count:gem_count + mines_count]

        return jsonify({
            'status': 'success',
            'gems': gems,
            'bombs': bombs,
            'timestamp': str(time.time())
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create a cloudscraper instance with mobile browser settings
def create_stake_scraper():
    return cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'android',
            'desktop': False,
            'mobile': True
        },
        delay=5,  # Delay between retries
        interpreter='js2py'  # Use js2py for JavaScript challenge solving
    )

# DEPRECATED: This function is no longer used - Extension fetches data from Stake API
# Backend only receives data from extension, never connects to Stake API directly
def fetch_stake_game_data(access_token):
    scraper = create_stake_scraper()
    max_retries = 5
    retry_delay = 3
    hosts = ["stake.com", "stake.ac"]

    for host in hosts:
        api_url = f"https://{host}/_api/casino/active-bet/mines"
        for attempt in range(max_retries):
            try:
                logger.info(f"Sending POST request to {host} Mines API... (Attempt {attempt+1}/{max_retries})")

                headers = {
                    'Content-Type': 'application/json',
                    'x-access-token': access_token,
                    'Origin': f'https://{host}',
                    'Referer': f'https://{host}/casino/games/mines'
                }

                response = scraper.post(
                    api_url,
                    json={},
                    headers=headers,
                    timeout=30
                )

                logger.info(f"Response Status Code: {response.status_code}")
                response.raise_for_status()
                json_response = response.json()
                logger.info(f"Successfully fetched Mines game data from {host}")
                return json_response

            except (cloudscraper.exceptions.CloudflareChallengeError, requests.exceptions.HTTPError) as e:
                logger.error(f"Cloudflare/HTTP Error ({host}): {e}")
                if attempt < max_retries - 1:
                    sleep_time = retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    sleep(sleep_time)
                else:
                    logger.error(f"Max retries reached for host {host}.")

            except requests.exceptions.RequestException as e:
                logger.error(f"Request Error ({host}): {e}")
                if attempt < max_retries - 1:
                    sleep_time = retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    sleep(sleep_time)
                else:
                    logger.error(f"Max retries reached for host {host}.")

            except json.JSONDecodeError as e:
                logger.error(f"JSON Decode Error ({host}): {e}")
                if attempt < max_retries - 1:
                    sleep_time = retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    sleep(sleep_time)
                else:
                    logger.error(f"Max retries reached for host {host}.")

    return None

@app.route('/stake_predict', methods=['POST'])
def stake_predict():
    try:
        data = request.json
        access_token = data.get('access_token')
        game_data = data.get('game_data')
        mines_count = int(data.get('mines', 1))

        if not access_token:
            return jsonify({'error': 'Stake API token is required'}), 400
            
        if not game_data:
            return jsonify({'error': 'Game data is required'}), 400

        # Use game data from Stake API to generate a seed
        game_id = game_data.get('id', '')
        bet_amount = game_data.get('betAmount', '')
        currency = game_data.get('currency', '')
        
        # Create a unique seed from the game data
        seed_data = f"{game_id}_{bet_amount}_{currency}_{access_token}"
        
        # Set random seed using game data
        random.seed(seed_data + str(time.time()))

        # Generate all possible positions and shuffle them
        positions = list(range(25))
        random.shuffle(positions)

        # Determine gem count based on mines count
        if mines_count == 1:
            gem_count = random.randint(6, 10)
        elif mines_count == 2:
            gem_count = random.randint(2, 6)
        elif mines_count == 3:
            gem_count = random.randint(2, 4)
        elif mines_count == 4:
            gem_count = random.randint(1, 4)
        elif mines_count in (5, 6):
            gem_count = random.randint(2, 3)
        else:
            gem_count = random.randint(1, 3)

        # Split positions into gems and bombs
        gems = positions[:gem_count]
        bombs = positions[gem_count:gem_count + mines_count]

        return jsonify({
            'status': 'success',
            'gems': gems,
            'bombs': bombs,
            'timestamp': str(time.time()),
            'game_id': game_id,
            'bet_amount': bet_amount,
            'currency': currency
        })

    except Exception as e:
        logger.error(f"Error in stake_predict: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/stake_game_data', methods=['POST'])
def stake_game_data():
    """Get game data from extension cache - NO direct Stake API calls"""
    try:
        data = request.json
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({'error': 'Stake API token is required', 'status': 'error'}), 400
        
        # Get game data from extension cache (extension fetches from Stake API)
        if access_token in connected_extensions:
            extension_data = connected_extensions[access_token].get('game_data')
            if extension_data:
                # Return formatted game data for frontend
                game_data = {
                    'id': extension_data.get('bet_id', ''),
                    'betAmount': extension_data.get('bet_amount', ''),
                    'currency': extension_data.get('currency', ''),
                    'mines': extension_data.get('mines', 3),
                    'is_active': extension_data.get('is_active', False)
                }
                
                # Get username from extension data or stored username
                username = extension_data.get('username') or connected_extensions[access_token].get('username')
                if username:
                    game_data['user'] = {'name': username}
                
                return jsonify({
                    'status': 'success',
                    'game_data': game_data,
                    'is_active': extension_data.get('is_active', False)
                })
        
        # No extension data available - return inactive
        return jsonify({
            'status': 'success',
            'game_data': None,
            'is_active': False,
            'message': 'No active game data from extension'
        })
        
    except Exception as e:
        logger.error(f"Error in stake_game_data: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'is_active': False
        }), 500

@app.route('/verify', methods=['POST'])
def verify_key():
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                "status": "error",
                "message": "No key provided"
            }), 400
        
        key = data['key']
        device_id = request.headers.get('X-Device-ID')

        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device ID required"
            }), 400
            
        # Check if key exists in any JSON file
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
            
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        timed_key_data = find_in_json_list(timed_keys, 'id', key)
            
        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_key_data = find_in_json_list(invalid_keys, 'id', key)

        # Check if key is invalidated
        if invalid_key_data:
            return jsonify({
                "status": "error",
                "message": "This key has been invalidated",
                "valid": False
            }), 401

        # Check regular keys first
        if key_data:
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device",
                        "valid": False
                    }), 401
                
                return jsonify({
                    "status": "success",
                    "message": "Key verified successfully",
                    "valid": True,
                    "key": key
                })
            else:
                # First time verification - bind the key to this device
                update_json_item(KEYS_JSON_FILE, 'id', key, {
                    'device_id': device_id,
                    'activated_at': datetime.now(timezone.utc).isoformat()
                })
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully",
                    "valid": True,
                    "key": key
                })
                
        # Check timed keys
        elif timed_key_data:
            key_data = timed_key_data
            expiry = convert_to_utc(key_data.get('expiry'))
            
            if expiry is None:
                return jsonify({
                    "status": "error",
                    "message": "Invalid expiry date format",
                    "valid": False
                }), 500
            
            # Check if key has expired
            if expiry < datetime.now(timezone.utc):
                return jsonify({
                    "status": "error",
                    "message": "This timed key has expired",
                    "valid": False
                }), 401
            
            # Check device binding
            if key_data.get('device_id'):
                if device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device",
                        "valid": False
                    }), 401
                
                return jsonify({
                    "status": "success",
                    "message": "Key verified successfully",
                    "valid": True,
                    "key": key
                })
            else:
                # First time verification - bind the key to this device
                update_json_item(TIMED_KEYS_JSON_FILE, 'id', key, {
                    'device_id': device_id,
                    'activated_at': datetime.now(timezone.utc).isoformat()
                })
                
                return jsonify({
                    "status": "success",
                    "message": "Key activated successfully",
                    "valid": True,
                    "key": key
                })
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid key",
                "valid": False
            }), 401
        
    except Exception as e:
        logger.error(f"Error in verify_key: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "valid": False
        }), 500

@app.route('/get-protected-vars', methods=['POST'])
def get_protected_vars():
    """Get protected variables if key or approved access is valid"""
    try:
        device_id = request.headers.get('X-Device-ID')

        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device ID required"
            }), 400

        data = request.get_json() or {}
        key = data.get('key')

        if key:
            keys = read_json_file(KEYS_JSON_FILE)
            key_data = find_in_json_list(keys, 'id', key)

            timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
            timed_key_data = find_in_json_list(timed_keys, 'id', key)

            invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
            invalid_key_data = find_in_json_list(invalid_keys, 'id', key)

            if invalid_key_data:
                return jsonify({
                    "status": "error",
                    "message": "This key has been invalidated"
                }), 401

            if key_data:
                if key_data.get('device_id') and device_id != key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
            elif timed_key_data:
                expiry = convert_to_utc(timed_key_data.get('expiry'))
                if expiry is None or expiry < datetime.now(timezone.utc):
                    return jsonify({
                        "status": "error",
                        "message": "This timed key has expired"
                    }), 401
                if timed_key_data.get('device_id') and device_id != timed_key_data['device_id']:
                    return jsonify({
                        "status": "error",
                        "message": "This key is registered to another device"
                    }), 401
            else:
                return jsonify({
                    "status": "error",
                    "message": "Invalid key"
                }), 401
        else:
            active = has_active_access(device_id)
            if not active:
                return jsonify({
                    "status": "error",
                    "message": "No active access for this device"
                }), 401

        return jsonify({
            "status": "success",
            "data": {
                "gemHTML": PROTECTED_VARS.get("gemHTML", ""),
                "bombHTML": PROTECTED_VARS.get("bombHTML", ""),
                "clickedBombHTML": PROTECTED_VARS.get("clickedBombHTML", ""),
                "normalHTML": PROTECTED_VARS.get("normalHTML", ""),
                "resultDivHTML": PROTECTED_VARS.get("resultDivHTML", "")
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_protected_vars: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/get-key-details/<key_type>', methods=['GET'])
def get_key_details(key_type):
    """Get detailed information about keys of a specific type"""
    try:
        if key_type == 'total':
            return get_all_keys()
            
        elif key_type == 'bound':
            # Get bound keys from both regular and timed JSON files
            regular_keys = read_json_file(KEYS_JSON_FILE)
            regular_bound_data = [key for key in regular_keys if key.get('device_id')]
                
            timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
            timed_bound_data = [key for key in timed_keys if key.get('device_id')]
                
            bound_keys = []
            
            # Add regular bound keys
            for key in regular_bound_data:
                bound_keys.append({
                    'id': key['id'],
                    'type': 'regular',
                    'device_id': key.get('device_id'),
                    'activated_at': key.get('activated_at'),
                    'created_at': key.get('created_at')
                })
                
            # Add timed bound keys
            now = datetime.now(timezone.utc)
            for key in timed_bound_data:
                expiry = convert_to_utc(key.get('expiry'))
                if expiry and expiry > now:
                    bound_keys.append({
                        'id': key['id'],
                        'type': 'timed',
                        'device_id': key.get('device_id'),
                        'activated_at': key.get('activated_at'),
                        'created_at': key.get('created_at'),
                        'expiry': key.get('expiry')
                    })
                    
            return jsonify({
                'status': 'success',
                'keys': bound_keys
            })
            
        elif key_type == 'unused':
            # Get unused keys from both regular and timed JSON files
            regular_keys = read_json_file(KEYS_JSON_FILE)
            regular_unused_data = [key for key in regular_keys if not key.get('device_id')]
                
            timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
            timed_unused_data = [key for key in timed_keys if not key.get('device_id')]
                
            unused_keys = []
            
            # Add regular unused keys
            for key in regular_unused_data:
                unused_keys.append({
                    'id': key['id'],
                    'type': 'regular',
                    'created_at': key.get('created_at')
                })
                
            # Add timed unused keys
            now = datetime.now(timezone.utc)
            for key in timed_unused_data:
                expiry = convert_to_utc(key.get('expiry'))
                if expiry and expiry > now:
                    unused_keys.append({
                        'id': key['id'],
                        'type': 'timed',
                        'created_at': key.get('created_at'),
                        'expiry': key.get('expiry')
                    })
                    
            return jsonify({
                'status': 'success',
                'keys': unused_keys
            })
            
        elif key_type == 'invalidated':
            # Get all invalidated keys
            invalid_keys_data = read_json_file(INVALID_KEYS_JSON_FILE)
                
            return jsonify({
                'status': 'success',
                'keys': [{
                    'id': key['id'],
                    'type': 'invalid',
                    'invalidated_at': key.get('invalidated_at'),
                    'previous_data': key.get('previous_data')
                } for key in invalid_keys_data]
            })
            
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid key type'
            }), 400
            
    except Exception as e:
        logger.error(f"Error in get_key_details: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def generate_session_id():
    """Generate a UUID v4 format string without using uuid module"""
    # Generate 16 random bytes (128 bits)
    random_bytes = ''.join(random.choices('0123456789abcdef', k=32))
    
    # Insert UUID version (4)
    random_bytes = f"{random_bytes[:12]}4{random_bytes[13:]}"
    
    # Insert UUID variant (8, 9, a, or b)
    random_bytes = f"{random_bytes[:16]}{random.choice('89ab')}{random_bytes[17:]}"
    
    # Format as UUID
    return f"{random_bytes[:8]}-{random_bytes[8:12]}-{random_bytes[12:16]}-{random_bytes[16:20]}-{random_bytes[20:]}"

def validate_session(device_id):
    """Validate if a device has an active session and valid key"""
    try:
        now = datetime.now(timezone.utc)
        
        # Get active session for device
        sessions = read_json_file(SESSIONS_JSON_FILE)
        session = find_in_json_list(sessions, 'device_id', device_id)
            
        if not session:
            return False
            
        key = session['key']
        
        # Check if key exists in invalid_keys
        invalid_keys = read_json_file(INVALID_KEYS_JSON_FILE)
        invalid_key_data = find_in_json_list(invalid_keys, 'id', key)
            
        if invalid_key_data:
            # Delete session if key is invalid
            delete_json_item(SESSIONS_JSON_FILE, 'device_id', device_id)
            return False
            
        # Check if key exists in timed_keys and is not expired
        timed_keys = read_json_file(TIMED_KEYS_JSON_FILE)
        timed_key_data = find_in_json_list(timed_keys, 'id', key)
            
        if timed_key_data:
            key_expiry = convert_to_utc(timed_key_data.get('expiry'))
            
            if key_expiry and key_expiry < now:
                # Delete session if timed key is expired
                delete_json_item(SESSIONS_JSON_FILE, 'device_id', device_id)
                return False
                
        # Check if key exists in regular keys
        keys = read_json_file(KEYS_JSON_FILE)
        key_data = find_in_json_list(keys, 'id', key)
            
        if not key_data and not timed_key_data:
            # Delete session if key doesn't exist in either JSON file
            delete_json_item(SESSIONS_JSON_FILE, 'device_id', device_id)
            return False
            
        return True
    except Exception as e:
        logger.error(f"Error validating session: {e}")
        return False

def create_session(key, device_id):
    """Create a new session in the sessions JSON file"""
    try:
        # Check for existing session
        sessions = read_json_file(SESSIONS_JSON_FILE)
        existing_session = find_in_json_list(sessions, 'device_id', device_id)
            
        if existing_session:
            # Update existing session with new key
            update_json_item(SESSIONS_JSON_FILE, 'device_id', device_id, {
                'key': key,
                'updated_at': datetime.now(timezone.utc).isoformat()
            })
            return existing_session['id']
            
        # Create new session
        session_id = generate_session_id()
        new_session = {
            'id': session_id,
            'key': key,
            'device_id': device_id,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        add_json_item(SESSIONS_JSON_FILE, new_session)
            
        return session_id
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        return None

@app.route('/check-session', methods=['POST'])
def check_session():
    """Check if a device has a valid session and key"""
    try:
        device_id = request.headers.get('X-Device-ID')
        if not device_id:
            return jsonify({
                'status': 'error',
                'message': 'Device ID required',
                'valid': False
            }), 401
            
        # Get request data
        data = request.get_json() or {}
        predictor_type = data.get('predictor_type', 'mines')  # Default to mines
        
        is_valid = validate_session(device_id)
        
        # Get user record by device_id
        user_record = None
        try:
            all_requests = read_json_file(ACCESS_REQUESTS_JSON_FILE)
            for req in all_requests:
                if req.get('device_id') == device_id:
                    user_record = req
                    break
        except Exception:
            pass
        
        # Prepare response with access information
        response_data = {
            'status': 'success',
            'valid': is_valid,
            'mines_access_enabled': user_record.get('mines_access_enabled', False) if user_record else False,
            'crash_access_enabled': user_record.get('crash_access_enabled', False) if user_record else False,
            'blackjack_access_enabled': user_record.get('blackjack_access_enabled', False) if user_record else False,
            'moles_access_enabled': user_record.get('moles_access_enabled', False) if user_record else False
        }
        
        # If session is valid and user record exists, add user details
        if is_valid and user_record:
            response_data['username'] = user_record.get('username', user_record.get('email', 'Unknown'))
            response_data['status'] = user_record.get('status', 'pending')
            
            # Update last activity time
            try:
                now_iso = datetime.now(timezone.utc).isoformat()
                if predictor_type == 'mines':
                    user_record['mines_last_used_at'] = now_iso
                    login_count = user_record.get('mines_logins_count', 0)
                    user_record['mines_logins_count'] = int(login_count) + 1
                elif predictor_type == 'crash':
                    user_record['crash_last_used_at'] = now_iso
                    login_count = user_record.get('crash_logins_count', 0)
                    user_record['crash_logins_count'] = int(login_count) + 1
                elif predictor_type == 'blackjack':
                    user_record['blackjack_last_used_at'] = now_iso
                    login_count = user_record.get('blackjack_logins_count', 0)
                    user_record['blackjack_logins_count'] = int(login_count) + 1
                elif predictor_type == 'moles':
                    user_record['moles_last_used_at'] = now_iso
                
                # Save updated user data
                write_json_file(ACCESS_REQUESTS_JSON_FILE, all_requests)
            except Exception:
                pass  # Don't fail the request if we can't update activity
        
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error checking session: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'valid': False
        }), 500

@app.route('/update-predictor-access', methods=['POST'])
def update_predictor_access():
    """Update predictor access for a user"""
    try:
        data = request.get_json() or {}
        request_id = data.get('request_id')
        email = data.get('email')
        mines_access_enabled = data.get('mines_access_enabled', False)
        crash_access_enabled = data.get('crash_access_enabled', False)
        blackjack_access_enabled = data.get('blackjack_access_enabled', False)
        moles_access_enabled = data.get('moles_access_enabled', False)
        fake_mines_access_enabled = data.get('fake_mines_access_enabled', False)
        mines_duration = data.get('mines_duration')
        mines_unit = data.get('mines_unit') or 'd'
        crash_duration = data.get('crash_duration')
        crash_unit = data.get('crash_unit') or 'd'
        blackjack_duration = data.get('blackjack_duration')
        blackjack_unit = data.get('blackjack_unit') or 'd'
        moles_duration = data.get('moles_duration')
        moles_unit = data.get('moles_unit') or 'd'
        
        if not request_id and not email:
            return jsonify({
                'status': 'error',
                'message': 'Request ID or email required'
            }), 400
        
        all_requests = read_json_file(ACCESS_REQUESTS_JSON_FILE)
        if not isinstance(all_requests, list):
            all_requests = []
        
        request_to_update = None
        if request_id:
            for req in all_requests:
                if isinstance(req, dict) and req.get('id') == request_id:
                    request_to_update = req
                    break
        
        if not request_to_update and email:
            existing, _, _ = get_latest_request_by_username(email, all_requests)
            if existing:
                request_to_update = existing
            else:
                now_iso = datetime.now(timezone.utc).isoformat()
                new_request = {
                    "id": generate_session_id(),
                    "device_id": None,
                    "email": email,
                    "username": email,
                    "created_at": now_iso,
                    "updated_at": now_iso,
                    "status": "approved"
                }
                all_requests.append(new_request)
                request_to_update = new_request
        
        if not request_to_update:
            return jsonify({
                'status': 'error',
                'message': 'Request not found'
            }), 404
        
        request_to_update['mines_access_enabled'] = mines_access_enabled
        request_to_update['crash_access_enabled'] = crash_access_enabled
        request_to_update['blackjack_access_enabled'] = blackjack_access_enabled
        request_to_update['moles_access_enabled'] = moles_access_enabled
        request_to_update['fake_mines_access_enabled'] = fake_mines_access_enabled
        
        if mines_access_enabled:
            mines_expires_at_iso = None
            if mines_duration is not None:
                try:
                    mines_duration_val = int(mines_duration)
                    if mines_duration_val > 0:
                        mines_expires_at = calculate_expiration_date(
                            datetime.now(timezone.utc),
                            mines_duration_val,
                            mines_unit
                        )
                        mines_expires_at_iso = mines_expires_at.isoformat()
                except Exception:
                    mines_expires_at_iso = None
            request_to_update['mines_expires_at'] = mines_expires_at_iso
        else:
            request_to_update['mines_expires_at'] = None
        
        if crash_access_enabled:
            crash_expires_at_iso = None
            if crash_duration is not None:
                try:
                    crash_duration_val = int(crash_duration)
                    if crash_duration_val > 0:
                        crash_expires_at = calculate_expiration_date(
                            datetime.now(timezone.utc),
                            crash_duration_val,
                            crash_unit
                        )
                        crash_expires_at_iso = crash_expires_at.isoformat()
                except Exception:
                    crash_expires_at_iso = None
            request_to_update['crash_expires_at'] = crash_expires_at_iso
        else:
            request_to_update['crash_expires_at'] = None

        if blackjack_access_enabled:
            blackjack_expires_at_iso = None
            if blackjack_duration is not None:
                try:
                    blackjack_duration_val = int(blackjack_duration)
                    if blackjack_duration_val > 0:
                        blackjack_expires_at = calculate_expiration_date(
                            datetime.now(timezone.utc),
                            blackjack_duration_val,
                            blackjack_unit
                        )
                        blackjack_expires_at_iso = blackjack_expires_at.isoformat()
                except Exception:
                    blackjack_expires_at_iso = None
            request_to_update['blackjack_expires_at'] = blackjack_expires_at_iso
        else:
            request_to_update['blackjack_expires_at'] = None

        if moles_access_enabled:
            moles_expires_at_iso = None
            if moles_duration is not None:
                try:
                    moles_duration_val = int(moles_duration)
                    if moles_duration_val > 0:
                        moles_expires_at = calculate_expiration_date(
                            datetime.now(timezone.utc),
                            moles_duration_val,
                            moles_unit
                        )
                        moles_expires_at_iso = moles_expires_at.isoformat()
                except Exception:
                    moles_expires_at_iso = None
            request_to_update['moles_expires_at'] = moles_expires_at_iso
        else:
            request_to_update['moles_expires_at'] = None
        
        write_json_file(ACCESS_REQUESTS_JSON_FILE, all_requests)
        
        return jsonify({
            'status': 'success',
            'message': 'Predictor access updated successfully'
        })
    except Exception as e:
        logger.error(f"Error updating predictor access: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/request-predictor-access', methods=['POST'])
def request_predictor_access():
    try:
        data = request.get_json() or {}
        username = data.get('username')
        predictor_type = data.get('predictor_type')
        request_message = data.get('request_message', '')

        if not username or not predictor_type:
            return jsonify({
                "status": "error",
                "message": "Username and predictor_type are required"
            }), 400
        
        if predictor_type not in ['mines', 'crash', 'blackjack', 'moles']:
            return jsonify({
                "status": "error",
                "message": "predictor_type must be 'mines', 'crash', 'blackjack', or 'moles'"
            }), 400

        record, index, requests_data = get_latest_request_by_username(username)
        if not record or index is None:
            return jsonify({
                "status": "error",
                "message": "No access record found for this username"
            }), 404

        # Create access request record
        access_request = {
            "id": generate_session_id(),
            "predictor_type": predictor_type,
            "request_message": request_message,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # Add to the user's access requests
        predictor_requests = record.get('predictor_access_requests', [])
        if not isinstance(predictor_requests, list):
            predictor_requests = []
        
        predictor_requests.append(access_request)
        record['predictor_access_requests'] = predictor_requests

        requests_data[index] = record
        write_json_file(ACCESS_REQUESTS_JSON_FILE, requests_data)

        return jsonify({
            "status": "success",
            "request": access_request
        })
    except Exception as e:
        logger.error(f"Error in request_predictor_access: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# --- Blackjack helpers + AI decision engine for extension /get_prediction ---

_BJ_PLAY_KEYS = frozenset({'hit', 'stand', 'double', 'split'})


def _bj_d_idx(dealer_up):
    if dealer_up == 11 or dealer_up == 1:
        return 9
    if dealer_up == 10:
        return 8
    return dealer_up - 2


def _bj_rank_to_dealer_up_value(rank_str):
    """Dealer up-card value for strategy (A counts as 11)."""
    r = str(rank_str if rank_str is not None else "").strip().upper()
    if r == "A":
        return 11
    if r in ("K", "Q", "J", "10", "T"):
        return 10
    try:
        v = int(float(r))
        if 2 <= v <= 10:
            return v
    except (ValueError, TypeError):
        pass
    return 11


def _bj_rank_scalar_for_compare(card):
    """Numeric comparison for hole-vs-up heuristics (A=11)."""
    return _bj_rank_to_dealer_up_value(card.get("rank") if card else "")


def _bj_dealer_up_index(dealer_cards):
    """
    Which dealer card is the exposed up-card for basic strategy.
    Stake (and most US online BJ) list the hole first, then the up-card — so
    index 1 is correct when two or more ranks are present without metadata.
    Also handles faceDown/hidden flags and 2-card low-vs-high heuristics.
    """
    if not dealer_cards:
        return 0
    n = len(dealer_cards)
    hidden_idxs = {
        i
        for i, c in enumerate(dealer_cards)
        if c.get("hidden")
        or c.get("faceDown")
        or c.get("face_down")
        or c.get("isFaceDown")
    }
    visible = [i for i in range(n) if i not in hidden_idxs]
    if len(visible) == 1:
        return visible[0]
    revealed_one = [i for i, c in enumerate(dealer_cards) if c.get("revealed") is True]
    if len(revealed_one) == 1:
        return revealed_one[0]
    if n == 1:
        return 0
    if n == 2:
        v0 = _bj_rank_scalar_for_compare(dealer_cards[0])
        v1 = _bj_rank_scalar_for_compare(dealer_cards[1])
        tens = (10, 11)
        if v0 in tens and v1 not in tens:
            return 0
        if v1 in tens and v0 not in tens:
            return 1
        if v0 <= 6 and v1 >= 7:
            return 1
        if v1 <= 6 and v0 >= 7:
            return 0
        return 1
    return min(1, n - 1)


def _bj_dealer_up_card(dealer_cards):
    if not dealer_cards:
        return None
    return dealer_cards[_bj_dealer_up_index(dealer_cards)]


def _bj_dealer_value_from_cards(dealer_cards):
    if not dealer_cards:
        return 11
    c = _bj_dealer_up_card(dealer_cards)
    return _bj_rank_to_dealer_up_value(c.get("rank") if c else "")


def _bj_hand_value_and_soft(cards):
    """
    Count every visible card from the API. Supports rank 'T' (ten) and numeric strings.
    Strategy always uses this — never the casino's `value` field alone (it can lag).
    """
    if not cards:
        return 0, False
    total = 0
    aces_as_11 = 0
    for c in cards:
        if not isinstance(c, dict):
            continue
        r = str(c.get("rank", "")).strip().upper()
        if r == "A":
            total += 11
            aces_as_11 += 1
        elif r in ("K", "Q", "J", "10", "T"):
            total += 10
        else:
            try:
                v = int(float(r))
                if 2 <= v <= 10:
                    total += v
            except (ValueError, TypeError):
                pass
    while total > 21 and aces_as_11 > 0:
        total -= 10
        aces_as_11 -= 1
    soft = aces_as_11 > 0 and total <= 21
    return total, soft


def _bj_chart_hard(total, dealer_up):
    idx = _bj_d_idx(dealer_up)
    if total >= 17:
        row = "SSSSSSSSSS"
    elif total == 16:
        row = "SSSSSHHHHH"
    elif total == 15:
        row = "SSSSSHHHHH"
    elif total == 14:
        row = "SSSSSHHHHH"
    elif total == 13:
        row = "SSSSSHHHHH"
    elif total == 12:
        row = "HHSSSHHHHH"
    elif total == 11:
        row = "DDDDDDDDDD"
    elif total == 10:
        row = "DDDDDDDDHH"
    elif total == 9:
        row = "HHDDDDHHHH"
    else:
        row = "HHHHHHHHHH"
    return row[idx]


def _bj_chart_soft(soft_total, dealer_up):
    idx = _bj_d_idx(dealer_up)
    if soft_total <= 13:
        row = "HHHDDHHHHH"
    elif soft_total == 14:
        row = "HHHDDHHHHH"
    elif soft_total == 15:
        row = "HHDDDHHHHH"
    elif soft_total == 16:
        row = "HHDDDHHHHH"
    elif soft_total == 17:
        row = "HDDDDHHHHH"
    elif soft_total == 18:
        row = "SDDDDSSHHH"
    elif soft_total == 19:
        row = "SSSSSDSSSS"
    else:
        row = "SSSSSSSSSS"
    return row[idx]


def _bj_chart_pair(rank, dealer_up):
    idx = _bj_d_idx(dealer_up)
    r = str(rank).upper()
    if r == "A":
        row = "PPPPPPPPPP"
    elif r == "8":
        row = "PPPPPPPPPP"
    elif r in ("10", "J", "Q", "K"):
        row = "SSSSSSSSSS"
    elif r == "9":
        row = "PPPPPSPPSS"
    elif r == "7":
        row = "PPPPPPHHHH"
    elif r == "6":
        row = "PPPPPPHHHH"
    elif r == "5":
        row = "DDDDDDDDHH"
    elif r == "4":
        row = "HHHPPHHHHH"
    elif r in ("3", "2"):
        row = "PPPPPPHHHH"
    else:
        row = "HHHHHHHHHH"
    return row[idx]


def _bj_normalize_allowed(actions):
    out = set()
    for a in actions or []:
        if not a:
            continue
        al = str(a).lower().strip()
        if al == "deal":
            continue
        # Stake sometimes sends camelCase
        if al == "double down" or al == "doubledown":
            al = "double"
        out.add(al)
    return out


def _bj_effective_allowed(cards, dealer_cards, allowed):
    """
    Stake often lists only 'deal' during transitions. If we already have player + dealer
    cards and a live total, infer hit/stand (+ double/split when legal) so strategy still runs.
    """
    play = allowed & _BJ_PLAY_KEYS
    if play:
        return allowed
    total, _ = _bj_hand_value_and_soft(cards)
    if not cards or not dealer_cards or total > 21:
        return allowed
    inferred = {'hit', 'stand'}
    if len(cards) == 2:
        inferred.add('double')
        if _bj_pair_rank_for_chart(cards):
            inferred.add('split')
    return allowed | inferred


def _bj_pair_rank_for_chart(cards):
    if len(cards) != 2:
        return None
    r0 = str(cards[0].get("rank", "")).strip().upper()
    r1 = str(cards[1].get("rank", "")).strip().upper()
    if r0 == r1:
        return r0
    tens = {"10", "J", "Q", "K", "T"}
    if r0 in tens and r1 in tens:
        return "10"
    return None


def _bj_safety_correct_action(action, total, soft, dealer_up):
    """
    Final guard: advice must match the *current* counted hand.
    Prevents 'hit' loops on pat hands (17+) or stiffs vs weak dealer up-cards.
    Returns (action, reason, ev_hint_or_None).
    """
    du = dealer_up
    if total > 21:
        return (
            "stand",
            "Bust — over 21; no more cards.",
            "Total is over 21. Do not draw again.",
        )
    if total == 21:
        return (
            "stand",
            "21 — stand pat.",
            "Never hit a made 21.",
        )
    if not soft:
        if total >= 17 and action == "hit":
            return (
                "stand",
                "Hard {} — stand (pat hand).".format(total),
                "You already have 17+ hard; drawing can only bust you.",
            )
        if 13 <= total <= 16 and 2 <= du <= 6 and action == "hit":
            return (
                "stand",
                "Hard {} vs dealer 2–6 — stand.".format(total),
                "Weak dealer up-card; let them hit and possibly bust.",
            )
        if total == 12 and 4 <= du <= 6 and action == "hit":
            return (
                "stand",
                "12 vs dealer 4–6 — stand.",
                "Enough to win often when the dealer is weak.",
            )
    elif soft and total >= 19 and action == "hit":
        return (
            "stand",
            "Soft {} — stand pat.".format(total),
            "Soft 19 or 20 is strong enough to stand.",
        )
    return action, None, None


def _bj_raw_chart_action(cards, dealer_up, can_split):
    total, soft = _bj_hand_value_and_soft(cards)
    if total > 21:
        return "S"
    pr = _bj_pair_rank_for_chart(cards) if can_split else None
    if pr is not None:
        return _bj_chart_pair(pr, dealer_up)
    if soft and total <= 21:
        return _bj_chart_soft(total, dealer_up)
    return _bj_chart_hard(total, dealer_up)


def _bj_refine_action(raw, allowed, cards, dealer_up, can_split):
    total, soft = _bj_hand_value_and_soft(cards)
    if total > 21:
        return "stand", "Bust — hand is over."

    def hard_fallback():
        return _bj_chart_hard(total, dealer_up)

    r = raw
    if r == "P":
        if "split" in allowed:
            return "split", "Basic strategy: split this pair."
        raw2 = _bj_raw_chart_action(cards, dealer_up, False)
        return _bj_refine_action(raw2, allowed, cards, dealer_up, False)

    if r == "D":
        if len(cards) == 2 and "double" in allowed:
            return "double", "Basic strategy: double down."
        if soft:
            ch = _bj_chart_soft(total, dealer_up)
            if ch == "D":
                if "hit" in allowed:
                    return "hit", "Cannot double — hit instead (soft total)."
                return "stand", "Cannot double — stand."
            return _bj_refine_action(ch, allowed, cards, dealer_up, can_split)
        ch = hard_fallback()
        if ch == "D" and "hit" in allowed:
            return "hit", "Cannot double — hit instead."
        return _bj_refine_action(ch, allowed, cards, dealer_up, can_split)

    if r == "Ds":
        if len(cards) == 2 and "double" in allowed:
            return "double", "Double if allowed; else stand."
        if "stand" in allowed:
            return "stand", "Cannot double — stand (soft 18–19 zone)."
        return "hit", "Cannot double — hit."

    if r == "S":
        if "stand" in allowed:
            return "stand", "Basic strategy: stand."
        if "hit" in allowed:
            return "hit", "Stand not listed — hit."
        return "stand", "Stand."

    if r == "H":
        if "hit" in allowed:
            return "hit", "Basic strategy: hit."
        if "stand" in allowed:
            return "stand", "Hit not available — stand."
        return "hit", "Hit."

    if r == "R":
        if "surrender" in allowed:
            return "surrender", "Surrender is best here if offered."
        return _bj_refine_action(hard_fallback(), allowed, cards, dealer_up, can_split)

    if "hit" in allowed:
        return "hit", "Fallback: hit."
    if "stand" in allowed:
        return "stand", "Fallback: stand."
    return "stand", "No clear action."


def _bj_get_openai_client():
    global _nvidia_openai_client
    if _nvidia_openai_client is not None:
        return _nvidia_openai_client
    if OpenAI is None:
        raise RuntimeError("openai package not installed")
    _nvidia_openai_client = OpenAI(
        base_url=NVIDIA_OPENAI_BASE_URL,
        api_key=NVIDIA_OPENAI_API_KEY,
    )
    return _nvidia_openai_client


def _bj_cards_to_text(cards):
    out = []
    for c in cards or []:
        if not isinstance(c, dict):
            continue
        rank = str(c.get("rank", "")).strip().upper() or "?"
        suit = str(c.get("suit", "")).strip().upper()
        out.append(f"{rank}{suit}" if suit else rank)
    return ", ".join(out) if out else "-"


def _bj_extract_json(text):
    raw = (text or "").strip()
    if not raw:
        return None
    md_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, flags=re.IGNORECASE)
    if md_match:
        raw = md_match.group(1).strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(raw[start : end + 1])
    except Exception:
        return None


def _bj_normalize_ai_action(action):
    a = str(action or "").strip().lower()
    if a in ("double down", "doubledown"):
        a = "double"
    return a


def _bj_extract_action_keyword(text):
    low = str(text or "").lower()
    if "double" in low:
        return "double"
    if "split" in low:
        return "split"
    if "stand" in low:
        return "stand"
    if "hit" in low:
        return "hit"
    return ""


def _bj_ai_fallback_action(allowed):
    allowed_play = sorted(allowed & _BJ_PLAY_KEYS)
    if not allowed_play:
        return "stand", "No playable action phase yet."
    if "stand" in allowed_play:
        return "stand", "AI unavailable; choosing safest legal move."
    if "hit" in allowed_play:
        return "hit", "AI unavailable; choosing legal fallback move."
    if "double" in allowed_play:
        return "double", "AI unavailable; choosing legal fallback move."
    return "split", "AI unavailable; choosing legal fallback move."


def _bj_ai_recommend_action(
    player_cards,
    dealer_cards,
    allowed,
    total,
    soft,
    preferred_action="",
):
    allowed_play = sorted(allowed & _BJ_PLAY_KEYS)
    if not allowed_play:
        raise ValueError("No playable actions available for AI.")

    dealer_up_card = _bj_dealer_up_card(dealer_cards) or {}
    dealer_up_value = _bj_dealer_value_from_cards(dealer_cards)

    prompt = (
        "You are a high-conviction blackjack decision engine.\n"
        "Return ONLY valid JSON with this exact shape:\n"
        "{\"action\":\"hit|stand|double|split\",\"reason\":\"...\",\"ev_hint\":\"...\"}\n\n"
        "Rules:\n"
        "1) action MUST be one of allowed_actions.\n"
        "2) reason must be short, aggressive, tactical, and specific to dealer up-card and hand texture.\n"
        "3) ev_hint must be concise, practical EV intuition.\n"
        "4) No markdown, no extra keys, no prose outside JSON.\n\n"
        f"allowed_actions: {allowed_play}\n"
        f"player_cards: {_bj_cards_to_text(player_cards)}\n"
        f"player_total: {total}\n"
        f"player_soft: {bool(soft)}\n"
        f"dealer_cards_visible_context: {_bj_cards_to_text(dealer_cards)}\n"
        f"dealer_up_card_rank: {str(dealer_up_card.get('rank', '')).upper()}\n"
        f"dealer_up_card_value: {dealer_up_value}\n"
        "Decision style: be decisive, no hedging words, no uncertainty language.\n"
        "Goal: maximize expected value for THIS exact live state."
    )

    client = _bj_get_openai_client()
    results = []

    def _run_one_model(model_cfg):
        model_name = model_cfg.get("model")
        raw_reply_local = ""
        try:
            stream_kwargs = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": model_cfg.get("temperature", 1.0),
                "top_p": model_cfg.get("top_p", 1.0),
                "max_tokens": model_cfg.get("max_tokens", 768),
                "stream": True,
            }
            extra_body = model_cfg.get("extra_body")
            if extra_body:
                stream_kwargs["extra_body"] = extra_body
            completion = client.chat.completions.create(**stream_kwargs)

            chunks = []
            for chunk in completion:
                if not getattr(chunk, "choices", None):
                    continue
                choice = chunk.choices[0]
                delta = getattr(choice, "delta", None)
                if delta is None:
                    continue
                content_piece = getattr(delta, "content", None)
                if content_piece is not None:
                    chunks.append(content_piece)
            raw_reply_local = "".join(chunks).strip()
        except Exception:
            # Retry once with non-stream mode for providers that are less stable on stream.
            non_stream_kwargs = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 1,
                "top_p": model_cfg.get("top_p", 1),
                "max_tokens": 16384,
                "stream": False,
            }
            extra_body = model_cfg.get("extra_body")
            if extra_body:
                non_stream_kwargs["extra_body"] = extra_body
            resp = client.chat.completions.create(**non_stream_kwargs)
            ch0 = (resp.choices or [None])[0]
            msg = getattr(ch0, "message", None) if ch0 is not None else None
            raw_reply_local = str(getattr(msg, "content", "") or "").strip()

        parsed = _bj_extract_json(raw_reply_local)
        action_local = ""
        reason_local = ""
        ev_hint_local = ""
        if isinstance(parsed, dict):
            action_local = _bj_normalize_ai_action(parsed.get("action"))
            reason_local = str(parsed.get("reason") or "").strip()
            ev_hint_local = str(parsed.get("ev_hint") or "").strip()
        else:
            action_local = _bj_extract_action_keyword(raw_reply_local)
            reason_local = "Model returned non-JSON; extracted action keyword."

        if action_local not in allowed_play:
            return None
        if not reason_local:
            reason_local = "Model-selected action for current live state."
        return {
            "model": model_cfg.get("name", model_name),
            "action": action_local,
            "reason": reason_local,
            "ev_hint": ev_hint_local,
            "raw_reply": raw_reply_local,
        }

    for cfg in BJ_ENSEMBLE_MODELS:
        try:
            one = _run_one_model(cfg)
            if one:
                results.append(one)
        except Exception as model_err:
            logger.warning(f"Blackjack AI model failed ({cfg.get('name')}): {model_err}")

    if not results:
        raise ValueError("All blackjack AI models failed or returned illegal actions.")

    vote_counts = Counter([r["action"] for r in results])
    top_count = max(vote_counts.values())
    finalists = [a for a, c in vote_counts.items() if c == top_count]

    chosen_action = None
    if preferred_action in finalists:
        chosen_action = preferred_action
    elif len(finalists) == 1:
        chosen_action = finalists[0]
    else:
        # Stable tie-break by model order in BJ_ENSEMBLE_MODELS.
        model_priority = [m["name"] for m in BJ_ENSEMBLE_MODELS]
        for model_name in model_priority:
            pick = next((r["action"] for r in results if r["model"] == model_name and r["action"] in finalists), None)
            if pick:
                chosen_action = pick
                break
        if not chosen_action:
            chosen_action = finalists[0]

    chosen = next((r for r in results if r["action"] == chosen_action), results[0])
    vote_text = ", ".join([f"{k}:{v}" for k, v in sorted(vote_counts.items())])
    reason = f"{chosen['reason']} [ensemble: {vote_text}]"
    ev_hint = chosen.get("ev_hint") or "Consensus-selected legal move from multi-model panel."
    raw_reply = json.dumps(
        {
            "selected_action": chosen_action,
            "selected_model": chosen.get("model"),
            "votes": dict(vote_counts),
            "preferred_action": preferred_action,
            "models_used": [r.get("model") for r in results],
        },
        ensure_ascii=False,
    )
    return chosen_action, reason, ev_hint, raw_reply


def _bj_recommend_hand(
    player_cards,
    dealer_cards,
    actions,
    api_value=None,
):
    allowed = _bj_normalize_allowed(actions)
    allowed = _bj_effective_allowed(player_cards, dealer_cards, allowed)
    total, soft = _bj_hand_value_and_soft(player_cards)
    dealer_up = _bj_dealer_value_from_cards(dealer_cards)
    allowed_actions = sorted(allowed & _BJ_PLAY_KEYS)
    can_split = len(player_cards) == 2 and "split" in allowed_actions
    preferred_action = ""
    try:
        if dealer_up and dealer_up >= 2:
            chart_raw_pref = _bj_raw_chart_action(player_cards, dealer_up, can_split)
            preferred_action = _bj_refine_action(
                chart_raw_pref,
                allowed,
                player_cards,
                dealer_up,
                can_split,
            )[0]
    except Exception:
        preferred_action = ""

    if total > 21:
        return {
            "action": "stand",
            "reason": "Bust — no playable moves.",
            "ev_hint": "",
            "dealer_up": dealer_up,
            "player_total": total,
            "player_soft": soft,
            "allowed_actions": allowed_actions,
            "chart_raw": "AI_BUST",
            "api_value": api_value,
        }

    if total == 21:
        return {
            "action": "stand",
            "reason": "21 — always stand.",
            "ev_hint": "Standing locks in a strong pat hand.",
            "dealer_up": dealer_up,
            "player_total": total,
            "player_soft": soft,
            "allowed_actions": allowed_actions,
            "chart_raw": "AI_21_STAND",
            "api_value": api_value,
        }

    if not allowed_actions:
        return {
            "action": "stand",
            "reason": "No action phase from table yet.",
            "ev_hint": "",
            "dealer_up": dealer_up,
            "player_total": total,
            "player_soft": soft,
            "allowed_actions": allowed_actions,
            "chart_raw": "NO_ACTION_PHASE",
            "api_value": api_value,
        }

    try:
        action, reason, ev_note, raw_reply = _bj_ai_recommend_action(
            player_cards,
            dealer_cards,
            allowed,
            total,
            soft,
            preferred_action=preferred_action,
        )
        chart_raw = raw_reply or "AI_JSON_EMPTY"
    except Exception as e:
        logger.warning(f"Blackjack AI recommendation failed: {e}")
        action, reason = _bj_ai_fallback_action(allowed)
        ev_note = "Fallback used because AI response was unavailable."
        chart_raw = f"AI_ERROR:{str(e)}"

    return {
        "action": action,
        "reason": reason,
        "ev_hint": ev_note,
        "dealer_up": dealer_up,
        "player_total": total,
        "player_soft": soft,
        "allowed_actions": allowed_actions,
        "chart_raw": chart_raw,
        "preferred_action": preferred_action,
        "api_value": api_value,
    }


def build_blackjack_prediction_payload(
    player_hands,
    dealer_hands,
    bet_id,
    bet_amount,
    currency,
    ai_pending=False,
):
    dealer_cards = []
    if dealer_hands and len(dealer_hands) > 0:
        dealer_cards = dealer_hands[0].get("cards") or []

    hands_out = []
    playable = False
    for i, ph in enumerate(player_hands or []):
        cards = ph.get("cards") or []
        acts = ph.get("actions") or []
        val = ph.get("value")
        comp_total, comp_soft = _bj_hand_value_and_soft(cards)
        base_allowed = _bj_normalize_allowed(acts)
        eff = _bj_effective_allowed(cards, dealer_cards, base_allowed)
        needs = eff & _BJ_PLAY_KEYS
        rec = None
        if cards and dealer_cards:
            if comp_total > 21 or needs:
                playable = True
                if not ai_pending:
                    rec = _bj_recommend_hand(
                        cards,
                        dealer_cards,
                        acts,
                        api_value=val,
                    )
        hands_out.append({
            "index": i,
            "cards": cards,
            "value": val,
            "computed_total": comp_total,
            "computed_soft": comp_soft,
            "actions": acts,
            "recommendation": rec,
        })

    up_idx = _bj_dealer_up_index(dealer_cards)
    up_c = dealer_cards[up_idx] if dealer_cards else None
    up_val = _bj_rank_to_dealer_up_value(up_c.get("rank") if up_c else "")

    return {
        "game_type": "blackjack",
        "bet_id": bet_id,
        "bet_amount": bet_amount,
        "currency": currency or "",
        "dealer_cards": dealer_cards,
        "dealer_up_index": up_idx,
        "dealer_up_rank": str(up_c.get("rank", "")).upper() if up_c else "",
        "dealer_up_suit": up_c.get("suit") if up_c else None,
        "dealer_up_value": up_val,
        "player_hands": hands_out,
        "playable": playable,
        "ai_pending": bool(ai_pending),
        "strategy": "AI blackjack ensemble (Minimax + Kimi + DeepSeek) · legal-action constrained",
    }


# Extension connection management for Mines and Crash
connected_extensions = {}  # {token: {connected_at, last_seen, game_data, api_token}}
extension_predictions = {}  # {token: {prediction_data, timestamp}}
last_bet_ids = {}  # {token: bet_id} - Track last processed bet to avoid duplicates
fallback_bet_ids = {}  # {token: synthetic_bet_id}
last_blackjack_signatures = {}  # {token: str} - Regenerate BJ advice when table state changes
last_moles_signatures = {}  # {token: str} - Regenerate moles advice on table updates

# Crash prediction per user (multiple users support)
crash_predictors = {}  # {token: AdvancedCrashPredictor instance}

# Mines/Gems configuration per stake username
mines_configs = {}  # {stake_username: {mines_location: [], gems_location: [], custom_mines: bool, custom_gems: bool, show_mines: bool, show_gems: bool}}
# Auto-generated locations from extension
auto_generated_locations = {}  # {stake_username: {auto_mines_location: [], auto_gems_location: []}}
crash_history_cache = {}  # {token: [crash_points]} - Cache crash history from extension
moles_learning_cache = {}  # {token: adaptive model state}


def _moles_norm_positions(values):
    if not isinstance(values, list):
        return []
    out = []
    for v in values:
        try:
            n = int(v)
        except Exception:
            continue
        if 0 <= n <= 6 and n not in out:
            out.append(n)
    return out


def _moles_get_model(token):
    model = moles_learning_cache.get(token)
    if isinstance(model, dict):
        if not isinstance(model.get('hole_bias'), list) or len(model.get('hole_bias')) != 7:
            model['hole_bias'] = [1.0 for _ in range(7)]
        if not isinstance(model.get('transition'), list) or len(model.get('transition')) != 7:
            model['transition'] = [[0.0 for _ in range(7)] for _ in range(7)]
        if not isinstance(model.get('prediction_history'), list):
            model['prediction_history'] = []
        if not isinstance(model.get('recent_resolved'), list):
            model['recent_resolved'] = []
        if not isinstance(model.get('recent_resolved_keys'), list):
            model['recent_resolved_keys'] = []
        if not isinstance(model.get('hole_stats'), list) or len(model.get('hole_stats')) != 7:
            model['hole_stats'] = [
                {'shown': 0, 'hit': 0, 'miss': 0, 'followed': 0, 'followed_loss': 0}
                for _ in range(7)
            ]
        if not isinstance(model.get('total_evaluated'), int):
            model['total_evaluated'] = 0
        if not isinstance(model.get('last_prediction_anchor'), str):
            model['last_prediction_anchor'] = ''
        return model
    model = {
        'hole_bias': [1.0 for _ in range(7)],
        'transition': [[0.0 for _ in range(7)] for _ in range(7)],
        'last_resolved_key': None,
        'last_predicted_hole': None,
        'prediction_history': [],
        'recent_resolved': [],
        'recent_resolved_keys': [],
        'hole_stats': [
            {'shown': 0, 'hit': 0, 'miss': 0, 'followed': 0, 'followed_loss': 0}
            for _ in range(7)
        ],
        'total_evaluated': 0,
        'last_prediction_anchor': '',
    }
    moles_learning_cache[token] = model
    return model


def _moles_apply_learning(model, rounds_recent):
    if not isinstance(rounds_recent, list) or not rounds_recent:
        return
    resolved = []
    for idx, r in enumerate(rounds_recent):
        moles = _moles_norm_positions(r.get('mole_positions'))
        if not moles:
            continue
        resolved.append({
            'idx': int(r.get('round_index')) if isinstance(r.get('round_index'), int) else idx,
            'moles': moles,
            'pick': r.get('pick') if isinstance(r.get('pick'), int) else None,
            'hit': r.get('hit') if isinstance(r.get('hit'), bool) else None,
        })
    if not resolved:
        return

    # Keep rolling resolved history so first round after a fresh bet can still predict
    # from recent real outcomes (similar to overlay behavior in moles.js).
    rr = model.get('recent_resolved') if isinstance(model.get('recent_resolved'), list) else []
    rrk = model.get('recent_resolved_keys') if isinstance(model.get('recent_resolved_keys'), list) else []
    for item in resolved:
        key = f"{item['idx']}:{','.join(map(str, item['moles']))}:{item['pick']}:{item['hit']}"
        if key in rrk:
            continue
        rr.append({'idx': item['idx'], 'moles': item['moles']})
        rrk.append(key)
    if len(rr) > 40:
        rr = rr[-40:]
    if len(rrk) > 80:
        rrk = rrk[-80:]
    model['recent_resolved'] = rr
    model['recent_resolved_keys'] = rrk

    latest = resolved[-1]
    latest_key = f"{latest['idx']}:{','.join(map(str, latest['moles']))}:{latest['pick']}:{latest['hit']}"
    if model.get('last_resolved_key') == latest_key:
        return

    # Learn transition only once per newly resolved round; avoids reinforcement spam on same snapshot.
    if len(resolved) >= 2:
        prev_round = resolved[-2]
        curr_round = resolved[-1]
        for frm in prev_round['moles']:
            for to in curr_round['moles']:
                model['transition'][frm][to] += 1.0

    # Reward/punish last suggested hole based on new resolved round.
    predicted = model.get('last_predicted_hole')
    if isinstance(predicted, int) and 0 <= predicted <= 6:
        stats = model['hole_stats'][predicted]
        stats['shown'] += 1
        followed = isinstance(latest.get('pick'), int) and int(latest.get('pick')) == predicted
        if predicted in latest['moles']:
            model['hole_bias'][predicted] = min(1.95, model['hole_bias'][predicted] + 0.1)
            stats['hit'] += 1
        else:
            model['hole_bias'][predicted] = max(0.3, model['hole_bias'][predicted] - 0.14)
            stats['miss'] += 1
        if followed:
            stats['followed'] += 1
            if latest.get('hit') is False:
                stats['followed_loss'] += 1
        model['total_evaluated'] = int(model.get('total_evaluated') or 0) + 1

    model['last_resolved_key'] = latest_key


def _moles_recent_count(history, hole, size):
    if not isinstance(history, list) or size <= 0:
        return 0
    return len([x for x in history[-size:] if x == hole])


def _moles_predict(token, rounds_recent, prediction_anchor=None):
    model = _moles_get_model(token)
    _moles_apply_learning(model, rounds_recent)
    history = model.get('prediction_history') if isinstance(model.get('prediction_history'), list) else []

    rounds = []
    for idx, r in enumerate(rounds_recent if isinstance(rounds_recent, list) else []):
        moles = _moles_norm_positions(r.get('mole_positions'))
        if not moles:
            continue
        rounds.append({'idx': idx, 'moles': moles})
    has_current_resolved = bool(rounds)

    strategy_label = 'Adaptive moles model (recent rounds + transition learning)'

    # If current bet has no resolved rounds yet (fresh /bet), fallback to rolling
    # history learned from previous rounds so UI can show first prediction immediately.
    if not rounds:
        fallback_rounds = model.get('recent_resolved') if isinstance(model.get('recent_resolved'), list) else []
        rounds = fallback_rounds[-10:] if fallback_rounds else []
        strategy_label = 'Adaptive moles model (pre-round memory + transition learning)'
    pre_round_mode = (not has_current_resolved)

    # Absolute fallback: use bias/transition even if no history is available.
    if not rounds:
        raw_scores = []
        for hole in range(7):
            row = model['transition'][hole] if hole < len(model['transition']) else [0.0] * 7
            trans_hint = (sum(row) / max(1.0, float(len(row)))) if isinstance(row, list) else 0.0
            bias_part = max(0.3, min(1.95, model['hole_bias'][hole])) / 2.0
            cooldown_penalty = _moles_recent_count(history, hole, 6) * 0.05
            absence_boost = min(0.16, max(0, 7 - _moles_recent_count(history, hole, 7)) * 0.018)
            raw_scores.append(max(0.0001, bias_part + (trans_hint * 0.02) + absence_boost - cooldown_penalty))
        score_total = sum(raw_scores) or 1.0
        probs = [{'hole': i, 'probability': raw_scores[i] / score_total} for i in range(7)]
        probs.sort(key=lambda x: x['probability'], reverse=True)
        best = probs[0]
        model['last_predicted_hole'] = best['hole']
        if prediction_anchor and prediction_anchor != model.get('last_prediction_anchor'):
            hist = model.get('prediction_history') if isinstance(model.get('prediction_history'), list) else []
            hist.append(best['hole'])
            if len(hist) > 12:
                hist = hist[-12:]
            model['prediction_history'] = hist
            model['last_prediction_anchor'] = prediction_anchor
        return {
            'predicted_hole': best['hole'],
            'predicted_hole_label': f"Hole {best['hole'] + 1}",
            'confidence': 50,
            'probabilities': probs,
            'strategy': 'Adaptive moles model (cold start bias)',
        }

    base_counts = [0.0 for _ in range(7)]
    burst_counts = [0.0 for _ in range(7)]

    for idx, r in enumerate(rounds):
        w = 1.0 + idx * 0.52
        for hole in r['moles']:
            base_counts[hole] += w

    for idx, r in enumerate(rounds[-3:]):
        w = 1.0 + idx * 0.8
        for hole in r['moles']:
            burst_counts[hole] += w

    transition_scores = [0.0 for _ in range(7)]
    if len(rounds) >= 1:
        prev = rounds[-1]['moles']
        for frm in prev:
            row = model['transition'][frm]
            row_total = sum(row)
            if row_total <= 0:
                continue
            for to in range(7):
                transition_scores[to] += row[to] / row_total

    base_total = sum(base_counts) or 1.0
    burst_total = sum(burst_counts) or 1.0
    trans_total = sum(transition_scores) or 1.0

    raw_scores = []
    recent3_hist = history[-3:]
    recent5_hist = history[-5:]
    recent6_hist = history[-6:]
    recent7_hist = history[-7:]
    recent12_hist = history[-12:]
    for hole in range(7):
        base_part = base_counts[hole] / base_total
        burst_part = burst_counts[hole] / burst_total
        trans_part = transition_scores[hole] / trans_total
        bias_part = max(0.3, min(1.95, model['hole_bias'][hole])) / 2.0
        stats = model['hole_stats'][hole] if isinstance(model.get('hole_stats'), list) and len(model['hole_stats']) > hole else {}
        shown = int(stats.get('shown') or 0)
        hit = int(stats.get('hit') or 0)
        followed = int(stats.get('followed') or 0)
        followed_loss = int(stats.get('followed_loss') or 0)
        perf_part = (hit + 1.0) / (shown + 2.0)
        follow_penalty = followed_loss / (followed + 1.0)
        repeat3 = len([x for x in recent3_hist if x == hole])
        repeat5 = len([x for x in recent5_hist if x == hole])
        repeat6 = len([x for x in recent6_hist if x == hole])
        repeat7 = len([x for x in recent7_hist if x == hole])
        repeat12 = len([x for x in recent12_hist if x == hole])
        sticky_penalty = 0.0
        if history and hole == history[-1]:
            sticky_penalty += 0.16
        if repeat3 >= 2:
            sticky_penalty += 0.14
        if repeat5 >= 3:
            sticky_penalty += 0.22
        if repeat6 >= 4:
            sticky_penalty += 0.32
        if repeat7 >= 3:
            sticky_penalty += 0.14
        if repeat12 >= 4:
            sticky_penalty += 0.18
        diversity_boost = 0.0
        if hole not in recent7_hist:
            diversity_boost += 0.18
        elif repeat7 == 0:
            diversity_boost += 0.08
        if hole not in recent12_hist:
            diversity_boost += 0.08
        score = (
            base_part * 0.44
            + burst_part * 0.20
            + trans_part * 0.20
            + perf_part * 0.08
            + bias_part * 0.12
            + diversity_boost
            - follow_penalty * 0.06
            - sticky_penalty
        )
        raw_scores.append(max(0.0001, score))

    score_total = sum(raw_scores) or 1.0
    probs = [{'hole': i, 'probability': raw_scores[i] / score_total} for i in range(7)]
    probs.sort(key=lambda x: x['probability'], reverse=True)

    # Anti-sticky selection:
    # avoid immediate repeat + ABAB loops + overused holes; also prefer underused
    # holes so the 7-hole cycle keeps moving with live history instead of sticking.
    last = history[-1] if history else None
    a = history[-3] if len(history) >= 3 else None
    b = history[-2] if len(history) >= 2 else None
    c = history[-1] if len(history) >= 1 else None
    fallback_best = probs[0]
    best = fallback_best
    rejected = []
    for cand in probs:
        hole = cand.get('hole')
        if not isinstance(hole, int) or hole < 0 or hole > 6:
            continue
        if last is not None and hole == last:
            rejected.append(hole)
            continue
        if len(history) >= 3 and a == c and hole == b:
            rejected.append(hole)
            continue
        recent3 = len([x for x in history[-3:] if x == hole])
        recent5 = len([x for x in history[-5:] if x == hole])
        recent7 = len([x for x in history[-7:] if x == hole])
        recent12 = len([x for x in history[-12:] if x == hole])
        if recent3 >= 2 or recent5 >= 3 or recent7 >= 3 or recent12 >= 4:
            rejected.append(hole)
            continue
        best = cand
        break

    if best is fallback_best and rejected:
        # If strict filters rejected all top candidates, prefer lower-repeat hole.
        ranked = []
        for cand in probs:
            hole = cand.get('hole')
            if not isinstance(hole, int):
                continue
            r3 = len([x for x in history[-3:] if x == hole])
            r5 = len([x for x in history[-5:] if x == hole])
            r7 = len([x for x in history[-7:] if x == hole])
            r12 = len([x for x in history[-12:] if x == hole])
            ranked.append((r12, r7, r5, r3, -float(cand.get('probability') or 0.0), cand))
        if ranked:
            ranked.sort(key=lambda t: (t[0], t[1], t[2], t[3], t[4]))
            best = ranked[0][5]

    # Hard anti-loop correction: if selected hole is too dominant in recent predictions,
    # switch to the best lower-repeat candidate.
    if history:
        best_hole = best.get('hole')
        if isinstance(best_hole, int):
            hot_recent4 = len([x for x in history[-4:] if x == best_hole])
            hot_recent6 = len([x for x in history[-6:] if x == best_hole])
            if hot_recent4 >= 3 or hot_recent6 >= 4:
                alt = None
                for cand in probs:
                    hole = cand.get('hole')
                    if not isinstance(hole, int) or hole == best_hole:
                        continue
                    r3 = len([x for x in history[-3:] if x == hole])
                    r5 = len([x for x in history[-5:] if x == hole])
                    r7 = len([x for x in history[-7:] if x == hole])
                    if r3 >= 2 or r5 >= 3 or r7 >= 3:
                        continue
                    alt = cand
                    break
                if alt:
                    best = alt

    # First prediction of a fresh bet should not lock to H1 by deterministic ordering.
    # If we are in pre-round mode and there is no history yet, prefer diversified top candidate.
    if pre_round_mode and not history and isinstance(best.get('hole'), int) and best.get('hole') == 0:
        for cand in probs:
            hole = cand.get('hole')
            if isinstance(hole, int) and hole != 0:
                best = cand
                break

    second = probs[1] if len(probs) > 1 else {'probability': 0.0}
    sep = max(0.0, best['probability'] - second['probability'])
    learning_boost = min(0.14, (int(model.get('total_evaluated') or 0) * 0.004))
    confidence = max(50, min(99, int(round((best['probability'] + sep * 0.8 + learning_boost) * 100))))

    model['last_predicted_hole'] = best['hole']
    if prediction_anchor and prediction_anchor != model.get('last_prediction_anchor'):
        history.append(best['hole'])
        if len(history) > 12:
            history = history[-12:]
        model['prediction_history'] = history
        model['last_prediction_anchor'] = prediction_anchor
    return {
        'predicted_hole': best['hole'],
        'predicted_hole_label': f"Hole {best['hole'] + 1}",
        'confidence': confidence,
        'probabilities': probs,
        'strategy': strategy_label,
    }


def _moles_extract_last_result(rounds_recent):
    if not isinstance(rounds_recent, list):
        return None
    for r in reversed(rounds_recent):
        if not isinstance(r, dict):
            continue
        hit = r.get('hit')
        if not isinstance(hit, bool):
            continue
        pick = r.get('pick') if isinstance(r.get('pick'), int) and 0 <= int(r.get('pick')) <= 6 else None
        round_index = r.get('round_index') if isinstance(r.get('round_index'), int) else None
        return {
            'label': 'Win' if hit else 'Lose',
            'hit': hit,
            'pick': pick,
            'round_index': round_index,
        }
    return None

@app.route('/extension_connect', methods=['POST', 'OPTIONS'])
def extension_connect():
    """Handle extension connection"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        url = data.get('url', '')
        
        if not token:
            response = jsonify({'status': 'error', 'message': 'Token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Register extension (token is the API token, used as unique identifier for multiple users)
        connected_extensions[token] = {
            'connected_at': time.time(),
            'last_seen': time.time(),
            'url': url,
            'game_data': None,
            'api_token': token  # Store API token for this user
        }
        
        # Initialize crash predictor for this user if not exists
        if token not in crash_predictors:
            crash_predictors[token] = AdvancedCrashPredictor()
        
        logger.info(f"✅ Extension connected - Token: {token[:10]}... (Total users: {len(connected_extensions)})")
        
        logger.info(f"✅ Extension connected with token: {token[:10]}...")
        
        response = jsonify({
            'status': 'success',
            'message': 'Connected successfully',
            'token': token
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Extension connect error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/extension_disconnect', methods=['POST', 'OPTIONS'])
def extension_disconnect():
    """Handle extension disconnection"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if token in connected_extensions:
            del connected_extensions[token]
            logger.info(f"❌ Extension disconnected: {token[:10]}...")
        
        if token in extension_predictions:
            del extension_predictions[token]
            
        # Clean up crash predictor and cache for this user
        if token in crash_predictors:
            del crash_predictors[token]
        if token in crash_history_cache:
            del crash_history_cache[token]
            
        if token in last_bet_ids:
            del last_bet_ids[token]
        if token in fallback_bet_ids:
            del fallback_bet_ids[token]
        if token in last_blackjack_signatures:
            del last_blackjack_signatures[token]
        if token in last_moles_signatures:
            del last_moles_signatures[token]
        if token in moles_learning_cache:
            del moles_learning_cache[token]
        
        response = jsonify({'status': 'success', 'message': 'Disconnected'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Extension disconnect error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/extension_game_data', methods=['POST', 'OPTIONS'])
def extension_game_data():
    """Receive game data from extension and generate prediction"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        game_type = data.get('game_type')
        
        if not token or not game_type:
            response = jsonify({'status': 'error', 'message': 'Token and game_type required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Update extension data (store all raw data from extension)
        if token in connected_extensions:
            connected_extensions[token]['last_seen'] = time.time()
            connected_extensions[token]['game_data'] = data
            # Also store username if provided
            if 'username' in data:
                connected_extensions[token]['username'] = data['username']
        
        prediction_generated = False
        should_clear = False
        
        # Generate prediction for mines game
        if game_type == 'mines':
            is_active = data.get('is_active', False)
            bet_id = data.get('bet_id', None)  # Unique bet identifier
            mines_count = data.get('mines', 3)
            is_fake_bet = data.get('is_fake_bet', False)  # Check if this is a fake bet from testmines.js
            if is_active and not bet_id:
                if token not in fallback_bet_ids:
                    fallback_bet_ids[token] = f"fallback_{int(time.time() * 1000)}_{mines_count}"
                bet_id = fallback_bet_ids[token]
            elif not is_active and token in fallback_bet_ids:
                del fallback_bet_ids[token]
            
            # Check if this is a NEW bet (not the same one we already predicted for)
            if is_active and bet_id:
                # Check if we already generated prediction for this bet
                last_bet = last_bet_ids.get(token)
                
                if last_bet != bet_id:
                    # NEW BET DETECTED - Generate fresh prediction
                    bet_type_label = "🎮 Fake bet" if is_fake_bet else "🎲 Real bet"
                    logger.info(f"{bet_type_label} detected for {token[:10]}... Bet ID: {bet_id}, Mines: {mines_count}")
                    
                    # Generate mines prediction using random algorithm with proper gem ranges
                    import random
                    
                    # Gem count ranges based on mines count
                    gem_ranges = {
                        1: (6, 10),  # 6-10 gems
                        2: (2, 6),   # 2-6 gems
                        3: (2, 4),   # 2-4 gems
                        4: (1, 4),   # 1-4 gems
                        5: (2, 3),   # 2-3 gems
                        6: (2, 3)    # 2-3 gems
                    }
                    
                    # Get gem count range for this mines count
                    if mines_count in gem_ranges:
                        min_gems, max_gems = gem_ranges[mines_count]
                        gem_count = random.randint(min_gems, max_gems)
                    else:
                        # Fallback for other mines counts
                        gem_count = max(1, min(10, 25 - mines_count))
                    
                    all_positions = list(range(25))
                    random.shuffle(all_positions)
                    
                    gem_positions = all_positions[:gem_count]
                    bomb_positions = random.sample([i for i in range(25) if i not in gem_positions], mines_count)
                    
                    # Store prediction
                    extension_predictions[token] = {
                        'game_type': 'mines',
                        'gems': gem_positions,
                        'bombs': bomb_positions,
                        'mines_count': mines_count,
                        'bet_id': bet_id,
                        'is_fake_bet': is_fake_bet,
                        'timestamp': time.time()
                    }
                    
                    # Update auto-generated locations for Diamond plan users who use username
                    if 'username' in data:
                        stake_username = data['username']
                        auto_generated_locations[stake_username] = {
                            'auto_mines_location': bomb_positions,
                            'auto_gems_location': gem_positions,
                            'updated_at': time.time()
                        }
                        logger.info(f"💎 Auto locations updated for Diamond user: {stake_username}")
                    
                    # Update last bet ID
                    last_bet_ids[token] = bet_id
                    
                    prediction_generated = True
                    logger.info(f"💎 Mines prediction generated for {token[:10]}... (Gems: {len(gem_positions)}, Bombs: {len(bomb_positions)}, Fake: {is_fake_bet})")
                else:
                    # Same bet - keep existing prediction
                    logger.debug(f"⏸️ Same bet continues for {token[:10]}... Keeping prediction")
                    prediction_generated = False  # Don't regenerate
            elif not is_active:
                # No active bet - but DON'T clear prediction yet
                # Keep prediction displayed until new bet starts
                logger.debug(f"⏳ No active bet for {token[:10]}... Waiting for new bet")
                prediction_generated = False
                # should_clear = True  # DON'T clear - let prediction stay
        
        # Generate prediction for crash game (using extension-provided data only)
        elif game_type == 'crash':
            # Extension should send crash_history in the data
            crash_history = data.get('crash_history', [])  # Array of crash points from extension
            
            # Update cache if extension sent history
            if crash_history and len(crash_history) > 0:
                crash_history_cache[token] = crash_history
                logger.info(f"📊 Crash history updated for {token[:10]}... ({len(crash_history)} points)")
            
            # Use cached history if available
            all_crash_points = crash_history_cache.get(token, [])
            
            if len(all_crash_points) >= 15:
                # Initialize predictor if not exists
                if token not in crash_predictors:
                    crash_predictors[token] = AdvancedCrashPredictor()
                
                predictor = crash_predictors[token]
                
                # Train if needed
                if not predictor.is_trained:
                    training_success = predictor.train_models(all_crash_points[::-1])
                    if training_success:
                        logger.info(f"🎯 Crash predictor trained for {token[:10]}...")
                
                # Generate prediction using cached history
                if predictor.is_trained:
                    stats_dict = {
                        'avg': sum(all_crash_points)/len(all_crash_points),
                        'highest': max(all_crash_points),
                        'lowest': min(all_crash_points),
                        'total_games': len(all_crash_points)
                    }
                    
                    prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
                    
                    if prediction_result:
                        # Store prediction
                        extension_predictions[token] = {
                            'game_type': 'crash',
                            'predictions': prediction_result,
                            'historical_data': {
                                'crash_points': all_crash_points,
                                'stats': stats_dict
                            },
                            'timestamp': time.time()
                        }
                        prediction_generated = True
                        logger.info(f"🎯 Crash prediction generated for {token[:10]}...")
            else:
                logger.debug(f"⏳ Insufficient crash history for {token[:10]}... ({len(all_crash_points)}/15 points needed)")
        
        elif game_type == 'blackjack':
            is_active = data.get('is_active', False)
            bet_id = data.get('bet_id')
            state_sig = data.get('state_signature') or ''
            player_hands = data.get('player_hands') or []
            dealer_hands = data.get('dealer_hands') or []
            bet_amount = data.get('bet_amount')
            currency = data.get('currency') or ''

            if is_active and player_hands and state_sig:
                prev_sig = last_blackjack_signatures.get(token)
                if prev_sig != state_sig:
                    preview_payload = build_blackjack_prediction_payload(
                        player_hands,
                        dealer_hands,
                        bet_id,
                        bet_amount,
                        currency,
                        ai_pending=True,
                    )
                    preview_payload['timestamp'] = time.time()
                    extension_predictions[token] = preview_payload

                    try:
                        payload = build_blackjack_prediction_payload(
                            player_hands,
                            dealer_hands,
                            bet_id,
                            bet_amount,
                            currency,
                            ai_pending=False,
                        )
                        payload['timestamp'] = time.time()
                        extension_predictions[token] = payload
                        logger.info(
                            f"🃏 Blackjack strategy updated for {token[:10]}... "
                            f"(hands={len(player_hands)}, sig={state_sig[:48]}...)"
                        )
                    except Exception as ai_err:
                        logger.warning(f"Blackjack AI build failed, keeping preview payload: {ai_err}")

                    last_blackjack_signatures[token] = state_sig
                    prediction_generated = True
            elif not is_active:
                # Round finished / lobby — drop cached blackjack so UI does not stick on old hands
                last_blackjack_signatures.pop(token, None)
                prev = extension_predictions.get(token)
                if prev and prev.get('game_type') == 'blackjack':
                    extension_predictions.pop(token, None)
        elif game_type == 'moles':
            state_sig = str(data.get('state_signature') or '')
            rounds_recent = data.get('rounds_recent') or []
            is_active = bool(data.get('is_active'))
            bet_id = data.get('bet_id')
            current_round = data.get('current_round')
            amount = data.get('bet_amount')
            currency = data.get('currency') or ''

            if not isinstance(rounds_recent, list):
                rounds_recent = []

            if (not is_active) or (not bet_id):
                # Do not show stale moles prediction before bet or after cashout.
                last_moles_signatures.pop(token, None)
                prev = extension_predictions.get(token)
                if prev and prev.get('game_type') == 'moles':
                    extension_predictions.pop(token, None)
                prediction_generated = False
            else:
                prev_sig = last_moles_signatures.get(token)
                if state_sig and prev_sig == state_sig:
                    prediction_generated = False
                else:
                    latest_round_index = None
                    if isinstance(rounds_recent, list):
                        for _round in reversed(rounds_recent):
                            if isinstance(_round, dict) and isinstance(_round.get('round_index'), int):
                                latest_round_index = int(_round.get('round_index'))
                                break
                    prediction_anchor = f"{bet_id}:{current_round}:{len(rounds_recent)}:{latest_round_index}"
                    pred = _moles_predict(token, rounds_recent, prediction_anchor=prediction_anchor)
                    if pred:
                        raw_last = data.get('last_round_result')
                        if isinstance(raw_last, dict) and isinstance(raw_last.get('hit'), bool):
                            last_result = {
                                'label': 'Win' if raw_last.get('hit') else 'Lose',
                                'hit': bool(raw_last.get('hit')),
                                'pick': raw_last.get('pick') if isinstance(raw_last.get('pick'), int) and 0 <= raw_last.get('pick') <= 6 else None,
                                'round_index': raw_last.get('round_index') if isinstance(raw_last.get('round_index'), int) else None,
                            }
                        else:
                            last_result = _moles_extract_last_result(rounds_recent)
                        payload = {
                            'game_type': 'moles',
                            'is_active': is_active,
                            'bet_id': bet_id,
                            'current_round': current_round,
                            'bet_amount': amount,
                            'currency': currency,
                            'round_count': len(rounds_recent),
                            'predicted_hole': pred['predicted_hole'],
                            'predicted_hole_label': pred['predicted_hole_label'],
                            'confidence': pred['confidence'],
                            'probabilities': pred['probabilities'],
                            'strategy': pred['strategy'],
                            'last_result': last_result,
                            'timestamp': time.time(),
                        }
                        extension_predictions[token] = payload
                        prediction_generated = True
                        logger.info(
                            f"🕳️ Moles prediction updated for {token[:10]}... "
                            f"(hole={payload['predicted_hole']}, conf={payload['confidence']}%, rounds={len(rounds_recent)})"
                        )
                    last_moles_signatures[token] = state_sig

        response = jsonify({
            'status': 'success',
            'has_prediction': prediction_generated,
            'should_clear': should_clear,
            'message': 'Game data received'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Extension game data error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/get_prediction', methods=['POST', 'OPTIONS'])
def get_prediction():
    """Frontend endpoint to get prediction generated by extension"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            response = jsonify({'status': 'error', 'message': 'Token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Check if extension is connected
        if token not in connected_extensions:
            response = jsonify({
                'status': 'error',
                'message': 'Extension not connected',
                'connected': False
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Get prediction if available
        if token in extension_predictions:
            prediction = extension_predictions[token]
            
            response = jsonify({
                'status': 'success',
                'connected': True,
                'prediction': prediction
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                'status': 'waiting',
                'connected': True,
                'message': 'Waiting for prediction'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
    except Exception as e:
        logger.error(f"Get prediction error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/check_extension', methods=['POST', 'OPTIONS'])
def check_extension():
    """Check if extension is connected for given token"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            # If no token provided, check if any extension is connected
            if connected_extensions:
                # Return first connected extension token
                first_token = next(iter(connected_extensions.keys()))
                response = jsonify({
                    'status': 'success',
                    'connected': True,
                    'token': first_token
                })
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            else:
                response = jsonify({
                    'status': 'success',
                    'connected': False,
                    'token': None
                })
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
        
        is_connected = token in connected_extensions
        
        # Clean up stale connections (older than 90 seconds).
        # Heartbeats can jitter; a larger window prevents false disconnects.
        current_time = time.time()
        stale_tokens = []
        for t, info in connected_extensions.items():
            if current_time - info['last_seen'] > 90:
                stale_tokens.append(t)
        
        for t in stale_tokens:
            del connected_extensions[t]
            if t in extension_predictions:
                del extension_predictions[t]
            if t in last_moles_signatures:
                del last_moles_signatures[t]
            if t in moles_learning_cache:
                del moles_learning_cache[t]
            logger.info(f"🧹 Cleaned up stale extension: {t[:10]}...")
        
        # Get username if available
        username = None
        if is_connected and token in connected_extensions:
            username = connected_extensions[token].get('username')
        
        response = jsonify({
            'status': 'success',
            'connected': is_connected,
            'token': token if is_connected else None,
            'username': username
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Check extension error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/get_extension_token', methods=['GET', 'OPTIONS'])
def get_extension_token():
    """Get token from connected extension (for frontend to auto-fill)"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        # Return first connected extension token
        if connected_extensions:
            first_token = next(iter(connected_extensions.keys()))
            response = jsonify({
                'status': 'success',
                'connected': True,
                'token': first_token
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                'status': 'success',
                'connected': False,
                'token': None
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
    except Exception as e:
        logger.error(f"Get extension token error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/crash_predict', methods=['POST', 'OPTIONS'])
def crash_predict():
    """Crash prediction endpoint - Always recalculates with latest data"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        crash_history = data.get('crash_history', [])  # Accept history from client
        
        if not access_token:
            response = jsonify({'status': 'error', 'error': 'Access token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Use provided history or cache
        new_data_provided = False
        if crash_history and len(crash_history) > 0:
            # New data provided - update cache
            cached_history = crash_history_cache.get(access_token, [])
            cached_hash = hash(str(cached_history))
            new_hash = hash(str(crash_history))
            
            if cached_hash != new_hash:
                crash_history_cache[access_token] = crash_history
                new_data_provided = True
                logger.info(f"📊 New crash history provided in request for {access_token[:10]}... ({len(crash_history)} points)")
            
            all_crash_points = crash_history
        else:
            all_crash_points = crash_history_cache.get(access_token, [])
        
        if len(all_crash_points) < 15:
            response = jsonify({
                'status': 'error', 
                'error': 'Need at least 15 historical crash points. Please provide crash_history in request or connect via extension.'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Initialize predictor if not exists
        if access_token not in crash_predictors:
            crash_predictors[access_token] = AdvancedCrashPredictor()
        
        predictor = crash_predictors[access_token]
        
        # Train or RETRAIN if new data provided or not trained yet
        if new_data_provided or not predictor.is_trained:
            training_success = predictor.train_models(all_crash_points[::-1])
            if not training_success:
                response = jsonify({'status': 'error', 'error': 'Could not train prediction models'})
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response, 400
            logger.info(f"🎯 Crash predictor {'retrained' if new_data_provided else 'trained'} for {access_token[:10]}...")
        
        # Always calculate fresh stats and generate new prediction
        stats_dict = {
            'avg': sum(all_crash_points)/len(all_crash_points),
            'highest': max(all_crash_points),
            'lowest': min(all_crash_points),
            'total_games': len(all_crash_points)
        }
        
        # Generate fresh prediction with latest data
        prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
        
        if not prediction_result:
            response = jsonify({'status': 'error', 'error': 'Could not generate prediction'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        logger.info(f"🎯 Crash prediction recalculated for {access_token[:10]}... Safe: {prediction_result.get('safe_prediction', 0):.2f}x")
        
        response = jsonify({
            'status': 'success',
            'predictions': prediction_result,
            'historical_data': {
                'total_games': len(all_crash_points),
                'average': stats_dict['avg'],
                'highest': stats_dict['highest'],
                'lowest': stats_dict['lowest'],
                'crash_points': all_crash_points
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Crash prediction error: {e}")
        response = jsonify({'status': 'error', 'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_connect', methods=['POST', 'OPTIONS'])
def mines_connect():
    """Handle extension connection with stake username"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Initialize config if not exists
        if stake_username not in mines_configs:
            mines_configs[stake_username] = {
                'mines_location': [],
                'gems_location': [],
                'custom_mines': False,
                'custom_gems': False,
                'show_mines': False,
                'show_gems': False,
                'connected_at': time.time(),
                'last_seen': time.time()
            }
        else:
            mines_configs[stake_username]['last_seen'] = time.time()
        
        logger.info(f"✅ Mines extension connected - Username: {stake_username}")
        
        response = jsonify({
            'status': 'success',
            'message': 'Connected successfully',
            'stake_username': stake_username
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines connect error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_get_config', methods=['POST', 'OPTIONS'])
def mines_get_config():
    """Extension polls for mines/gems configuration"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        if stake_username not in mines_configs:
            response = jsonify({
                'status': 'success',
                'config': {
                    'mines_location': [],
                    'gems_location': [],
                    'custom_mines': False,
                    'custom_gems': False,
                    'show_mines': False,
                    'show_gems': False
                }
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        config = mines_configs[stake_username]
        config['last_seen'] = time.time()
        
        response = jsonify({
            'status': 'success',
            'config': {
                'mines_location': config.get('mines_location', []),
                'gems_location': config.get('gems_location', []),
                'custom_mines': config.get('custom_mines', False),
                'custom_gems': config.get('custom_gems', False),
                'show_mines': config.get('show_mines', False),
                'show_gems': config.get('show_gems', False)
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines get config error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_set_config', methods=['POST', 'OPTIONS'])
def mines_set_config():
    """Frontend sets mines/gems configuration"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        mines_location = data.get('mines_location', [])
        gems_location = data.get('gems_location', [])
        custom_mines = data.get('custom_mines', False)
        custom_gems = data.get('custom_gems', False)
        show_mines = data.get('show_mines', False)
        show_gems = data.get('show_gems', False)
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Initialize if not exists
        if stake_username not in mines_configs:
            mines_configs[stake_username] = {
                'mines_location': [],
                'gems_location': [],
                'custom_mines': False,
                'custom_gems': False,
                'show_mines': False,
                'show_gems': False,
                'connected_at': time.time(),
                'last_seen': time.time()
            }
        
        # Update config
        mines_configs[stake_username]['mines_location'] = mines_location
        mines_configs[stake_username]['gems_location'] = gems_location
        mines_configs[stake_username]['custom_mines'] = custom_mines
        mines_configs[stake_username]['custom_gems'] = custom_gems
        mines_configs[stake_username]['show_mines'] = show_mines
        mines_configs[stake_username]['show_gems'] = show_gems
        mines_configs[stake_username]['last_seen'] = time.time()
        
        logger.info(f"✅ Config updated for {stake_username} - Mines: {len(mines_location)}, Gems: {len(gems_location)}")
        
        response = jsonify({
            'status': 'success',
            'message': 'Configuration updated successfully'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines set config error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_get_user_config', methods=['POST', 'OPTIONS'])
def mines_get_user_config():
    """Frontend gets configuration for a user"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        if stake_username not in mines_configs:
            response = jsonify({
                'status': 'success',
                'config': {
                    'mines_location': [],
                    'gems_location': [],
                    'custom_mines': False,
                    'custom_gems': False,
                    'show_mines': False,
                    'show_gems': False
                }
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        config = mines_configs[stake_username]
        
        response = jsonify({
            'status': 'success',
            'config': {
                'mines_location': config.get('mines_location', []),
                'gems_location': config.get('gems_location', []),
                'custom_mines': config.get('custom_mines', False),
                'custom_gems': config.get('custom_gems', False),
                'show_mines': config.get('show_mines', False),
                'show_gems': config.get('show_gems', False)
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines get user config error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_set_auto_locations', methods=['POST', 'OPTIONS'])
def mines_set_auto_locations():
    """Extension sends auto-generated mines/gems locations"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        auto_mines_location = data.get('auto_mines_location', [])
        auto_gems_location = data.get('auto_gems_location', [])
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Store auto-generated locations
        auto_generated_locations[stake_username] = {
            'auto_mines_location': auto_mines_location,
            'auto_gems_location': auto_gems_location,
            'updated_at': time.time()
        }
        
        response = jsonify({
            'status': 'success',
            'message': 'Auto locations updated'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines set auto locations error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/mines_get_auto_locations', methods=['POST', 'OPTIONS'])
def mines_get_auto_locations():
    """Frontend gets auto-generated mines/gems locations"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        stake_username = data.get('stake_username')
        
        if not stake_username:
            response = jsonify({'status': 'error', 'message': 'Stake username required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        if stake_username not in auto_generated_locations:
            response = jsonify({
                'status': 'success',
                'auto_mines_location': [],
                'auto_gems_location': []
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        locations = auto_generated_locations[stake_username]
        
        response = jsonify({
            'status': 'success',
            'auto_mines_location': locations.get('auto_mines_location', []),
            'auto_gems_location': locations.get('auto_gems_location', [])
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        logger.error(f"Mines get auto locations error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok', 
        'message': 'Mines & Crash Prediction Server is running',
        'connected_users': len(connected_extensions)
    })

# Files to start automatically when backend starts
# Add Python file names here (without .py extension, relative to project root)
filetostart = ['telegram_bot', 'main2','/home/container/xtream/telegram_bot']  # Example: ['telegram_bot', 'another_file', 'yet_another_file']

def start_python_files(files_to_start):
    """Start multiple Python files as separate processes"""
    if not files_to_start:
        return
    
    # Get the directory where this script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to project root (since backend.py is in extension/ folder)
    project_root = os.path.dirname(current_dir)
    
    for filename in files_to_start:
        # Add .py extension if not present
        if not filename.endswith('.py'):
            filename = filename + '.py'
        
        # Try multiple paths
        possible_paths = [
            os.path.join(project_root, filename),  # In project root
            os.path.join(current_dir, filename),   # In extension folder
            filename  # Current directory
        ]
        
        file_path = None
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break
        
        if file_path:
            try:
                logger.info(f"🚀 Starting {filename}...")
                # Start file as separate process
                if platform.system() == 'Windows':
                    # Windows: use CREATE_NEW_CONSOLE to show separate window
                    subprocess.Popen(
                        [sys.executable, file_path],
                        creationflags=subprocess.CREATE_NEW_CONSOLE,
                        cwd=os.path.dirname(file_path)
                    )
                else:
                    # Linux/Mac: start in background
                    subprocess.Popen(
                        [sys.executable, file_path],
                        cwd=os.path.dirname(file_path),
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                logger.info(f"✅ {filename} started successfully")
                sleep(0.5)  # Small delay between starts
            except Exception as e:
                logger.error(f"❌ Error starting {filename}: {e}")
        else:
            logger.warning(f"⚠️ File {filename} not found. Skipping...")

# Plan display names (UI only; stored plan codes remain unchanged)
PLAN_DISPLAY_NAMES = {
    "free": "Free",
    "demo": "Free",
    "trial": "Free",
    "silver": "Diamond",
    "gold": "Obsidian",
    "turbo": "Gold"
}


def get_plan_display_name(plan):
    key = (plan or "").strip().lower()
    return PLAN_DISPLAY_NAMES.get(key, (plan or "").strip() or "Free")


# Plan assets configuration
PLAN_ASSETS = {
    "free": {
        "scripts": [],
        "display_name": "Free",
        "description": "Free tier with limited access",
        "features": ["Basic Free predictions"]
    },
    "silver": {
        "scripts": [
            {
                "name": "Soul Predictor Connector",
                "type": "connector",
                "code": """// ==UserScript==
// @name         Soul Auto Connector @Stake
// @require      https://raw.githubusercontent.com/librarian1337/connectorforus/refs/heads/main/app.js
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Smart middleware for Soul Predictor
// @author       SoulTeam
// @match        https://stake.ac/*
// @match        https://*.stake.ac/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.soulpredictor.xyz
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

"""
            },
            {
                "name": "Soul Predictor Core",
                "type": "core",
                "code": """// ==UserScript==
// @name         Soul Predictor Core
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Advanced mines game predictor with enhanced stats, consistent performance, and accurate autoplay
// @require      https://raw.githubusercontent.com/librarian1337/IOFHWF-EBF0-23IB-BBBGLLG/refs/heads/main/IOFHWF%3BEBF0-23IB%3BBBBGLLGKJSFEBFL.js
// @author       Chief
// @match        https://stake.ac/*
// @grant        none
// ==/UserScript==

let webUrl = 'ac';"""
            }
        ],
        "display_name": "Diamond",
        "description": "Diamond tier with core predictor scripts",
        "features": ["Soul Predictor Connector", "Soul Predictor Core", "30 min access"]
    },
    "gold": {
        "scripts": [
            {
                "name": "Soul Predictor Connector",
                "type": "connector",
                "code": """// ==UserScript==
// @name         Soul Auto Connector @Stake
// @require      https://raw.githubusercontent.com/librarian1337/connectorforus/refs/heads/main/app.js
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Smart middleware for Soul Predictor
// @author       SoulTeam
// @match        https://stake.ac/*
// @match        https://*.stake.ac/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.soulpredictor.xyz
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-start
// ==/UserScript=="""
            },
            {
                "name": "Soul Predictor Core",
                "type": "core",
                "code": """// ==UserScript==
// @name         Soul Predictor Core
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Advanced mines game predictor with enhanced stats, consistent performance, and accurate autoplay
// @require      https://raw.githubusercontent.com/librarian1337/IOFHWF-EBF0-23IB-BBBGLLG/refs/heads/main/IOFHWF%3BEBF0-23IB%3BBBBGLLGKJSFEBFL.js
// @author       Chief
// @match        https://stake.ac/*
// @grant        none
// ==/UserScript==
"""
            }
        ],
        "display_name": "Obsidian",
        "description": "Obsidian tier with core predictor scripts",
        "features": ["Soul Predictor Connector", "Soul Predictor Core", "Extended access"]
    },
    "turbo": {
        "scripts": [
            {
                "name": "Maxmi larps",
                "type": "turbo",
                "code": """// ==UserScript==
// @name         Maxmi 2.0
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Beautiful balance UI, number-only input validation, auto-formatting, and enhanced gameplay
// @author       $ librarian
// @match        *://*.stake.ac/*
// @match        *://*.stake.games/*
// @match        *://*.stake.bet/*
// @match        *://*.stake.pet/*
// @match        *://*.stake1001.com/*
// @match        *://*.stake1002.com/*
// @match        *://*.stake1003.com/*
// @match        *://*.stake1004.com/*
// @match        *://*.stake1005.com/*
// @match        *://*.stake.mba/*
// @match        *://*.stake.jp/*
// @match        *://*.stake.bz/*
// @match        *://*.staketr.com/*
// @match        *://*.stake.ceo/*
// @match        *://*.stake.krd/*
// @match        *://*.stake.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript=="""
            }
        ],
        "display_name": "Gold",
        "description": "Gold tier with exclusive scripts - Fake Mines access",
        "features": ["Maxmi larps", "Fake Mines Access", "Priority support"]
    }
}


@app.route('/user-assets', methods=['POST'])
def get_user_assets():
    """Get user assets based on their subscription plan"""
    try:
        data = request.get_json() or {}
        email = data.get('email') or data.get('username')
        
        if not email:
            return jsonify({
                "status": "error",
                "message": "Email required"
            }), 400
        
        ensure_json_file_exists(USERS_JSON_FILE)
        users_data = read_json_file(USERS_JSON_FILE)
        if not isinstance(users_data, list):
            users_data = []
        
        user_row, _, _ = get_user_by_email(email, users_data)
        if not user_row:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404
        
        subscription_plan = user_row.get('subscription_plan', 'free')
        plan_expires_at = user_row.get('plan_expires_at')
        
        # Check if plan is active
        plan_active = False
        if plan_expires_at:
            try:
                plan_expiry_dt = convert_to_utc(plan_expires_at)
                if plan_expiry_dt and plan_expiry_dt > datetime.now(timezone.utc):
                    plan_active = True
            except Exception:
                plan_active = False
        
        # Get assets for the plan
        assets = PLAN_ASSETS.get(subscription_plan, PLAN_ASSETS["free"]).copy()
        assets["plan"] = subscription_plan
        assets["plan_name"] = PLAN_ASSETS.get(subscription_plan, PLAN_ASSETS["free"]).get("display_name", subscription_plan)
        assets["plan_active"] = plan_active
        assets["plan_expires_at"] = plan_expires_at
        assets["time_remaining"] = get_time_remaining(plan_expires_at) if plan_expires_at else None
        
        return jsonify({
            "status": "success",
            "assets": assets
        })
    except Exception as e:
        logger.error(f"Error in get_user_assets: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    logger.info("🚀 Starting Unified Prediction Server (Mines + Crash)...")
    logger.info("📊 Server will be available at http://127.0.0.1:1590")
    logger.info("")
    
    # Start additional Python files if specified
    if filetostart:
        logger.info("📁 Starting additional Python files...")
        start_python_files(filetostart)
        logger.info("")
    
    logger.info("🔗 Extension Endpoints:")
    logger.info("   - POST /extension_connect - Extension connection (supports multiple users)")
    logger.info("   - POST /extension_disconnect - Extension disconnection")
    logger.info("   - POST /extension_game_data - Receive game data from extension (NO API calls)")
    logger.info("   - POST /get_prediction - Get prediction for frontend")
    logger.info("   - POST /check_extension - Check extension status")
    logger.info("   - GET /get_extension_token - Get extension token")
    logger.info("")
    logger.info("🎮 Game Endpoints:")
    logger.info("   - POST /crash_predict - Generate crash prediction (uses extension data)")
    logger.info("   - GET /health - Health check")
    logger.info("")
    logger.info("💎 Mines/Gems Endpoints:")
    logger.info("   - POST /mines_connect - Extension connects with stake username")
    logger.info("   - POST /mines_get_config - Extension polls for mines/gems config")
    logger.info("   - POST /mines_set_config - Frontend sets mines/gems location")
    logger.info("   - POST /mines_get_user_config - Frontend gets user config")
    logger.info("   - POST /mines_set_auto_locations - Extension sends auto-generated locations")
    logger.info("   - POST /mines_get_auto_locations - Frontend gets auto-generated locations")
    logger.info("")
    logger.info("✅ Multiple users supported - Each API token is tracked separately")
    logger.info("✅ Backend does NOT connect to Stake API - Only receives data from extension")
    logger.info("✅ Extension fetches all data from Stake API and sends raw data to backend")
    logger.info("✅ Backend generates predictions based on extension-provided data only")
    logger.info("")
    app.run(host='127.0.0.1', port=5000, debug=True)

    
