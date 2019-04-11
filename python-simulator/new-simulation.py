# coding=utf8
import os
import json
import time
import requests
import sys
from copy import deepcopy
from requests import codes
from datetime import datetime
from threading import Thread,RLock
import Tkinter as tk
import tkMessageBox as messagebox

import urllib3
urllib3.disable_warnings()

DEF_HOST = 'https://ccins.andrew.at.tw'
DEF_HEIGHT = 50
DEF_WIDTH = 45
DEF_FONT_SIZE = 10


def refresh_screen(n_type, str_output):
    if n_type == 1:
        new_label2.configure(text=str_output)
        new_label2.update()
    elif n_type == 2:
        old_label2.configure(text=str_output)
        old_label2.update()
    elif n_type == 3:
        compare_label2.configure(text=str_output)
        compare_label2.update()


class CThreadCtrl(object):
    def __init__(self):
        self.new_thread = None
        self.old_thread = None
        self.compare_thread = None

    def start(self, dict_data):
        if dict_data:
            self.new_thread = Thread(target=self.__output_string, args=(1, dict_data.get('new', {})))
            self.new_thread.start()

            self.old_thread = Thread(target=self.__output_string, args=(2, dict_data.get('old', {})))
            self.old_thread.start()

            self.compare_thread = Thread(target=self.__output_string2, args=(dict_data.get('compare', {}),))
            self.compare_thread.start()

    def stop(self):
        if self.new_thread:
            self.new_thread.join()
            self.new_thread = None

        if self.old_thread:
            self.old_thread.join()
            self.old_thread = None

        if self.compare_thread:
            self.compare_thread.join()
            self.compare_thread = None

    def __output_string(self, n_type, dict_data):
        lst_history = []
        # refill car data
        dict_car = self.__refill_car_data(dict_data.get('input', {}))
        dict_tmp = deepcopy(dict_car)

        # printout car information
        str_ouput, _, _ = self.__output(dict_car,[], lst_history)
        refresh_screen(n_type, str_ouput)
        time.sleep(5)
        # wait for light transformation
        if 'output' in dict_data:
            for n_index, dict_output_data in enumerate(dict_data['output'].get('result', [])):
                # return car information
                if dict_tmp:
                    str_ouput, dict_tmp, lst_history = self.__output(dict_tmp, dict_output_data, lst_history)

                    # countdown
                    n_delay = dict_output_data.get('delay', 0)
                    self.__countdown(n_type, str_ouput, n_delay)

                # refresh screen
                if n_index != len(dict_data['output']['result']) - 1:
                    refresh_screen(n_type, str_ouput)
                else:
                    refresh_screen(n_type, str_ouput+'\r\r 結束!!!!')

    def __output_string2(self, dict_data):
        str_output = ''
        if dict_data:
            str_output += '傳統式花費時間: %d(秒)\r' %(dict_data.get('normalInsTakenTime', 0))
            str_output += '平衡式花費時間: %d(秒)\r' %(dict_data.get('computerControledInsTakenTime', 0))
            if 'time' in dict_data:
                str_output += '\r參數設定\r'
                str_output += '  1.車輛\r'
                str_output += '   左轉時間: %d(秒)\r' %(dict_data['time'].get('left', 0))
                str_output += '   直行時間: %d(秒)\r' %(dict_data['time'].get('straight', 0))
                str_output += '   右轉時間: %d(秒)\r' %(dict_data['time'].get('right', 0))
                str_output += '   行車間距時間: %d(秒)\r' %(dict_data['time'].get('car', 0))
                if 'lights' in dict_data['time']:
                    str_output += '  \r2.紅綠燈\r'
                    str_output += '     南北向\r'
                    str_output += '       左轉綠燈: %d(秒)\r' %(dict_data['time']['lights']['horizontal'].get('left', 0))
                    str_output += '       直行綠燈: %d(秒)\r' %(dict_data['time']['lights']['horizontal'].get('straight', 0))
                    str_output += '       右轉綠燈: %d(秒)\r' %(dict_data['time']['lights']['horizontal'].get('right', 0))
                    str_output += '     東西向\r'
                    str_output += '       左轉綠燈: %d(秒)\r' %(dict_data['time']['lights']['vertical'].get('left', 0))
                    str_output += '       直行綠燈: %d(秒)\r' %(dict_data['time']['lights']['vertical'].get('straight', 0))
                    str_output += '       右轉綠燈: %d(秒)\r' %(dict_data['time']['lights']['vertical'].get('right', 0))
        refresh_screen(3, str_output)

    def __output(self, dict_car, dict_light, lst_history):
        dict_waiting = {}
        if dict_car:
            dict_waiting = deepcopy(dict_car)
            dict_moving = {'N': {'S': [], 'W': [], 'E': []},
                           'S': {'N': [], 'E': [], 'W': []},
                           'E': {'W': [], 'N': [], 'S': []},
                           'W': {'E': [], 'S': [], 'N': []}}

            if dict_light and dict_light.get('allow', []):
                # fill car information for waiting and moving
                for dict_light_data in dict_light.get('allow', []):
                    str_location = self.__convert_location(dict_light_data.get('position', ''))
                    str_direction = self.__convert_direction(dict_light_data.get('direction', ''))
                    if not str_location or not str_direction:
                        continue
                    for str_key1, dict_value in dict_waiting.iteritems():
                        if str_location == str_key1:
                            for str_key2, lst_value in dict_value.iteritems():
                                if str_direction == str_key2:
                                    str_move_direction = self.__get_moving_key(str_location, str_direction)
                                    dict_moving[str_location][str_move_direction] = deepcopy(dict_waiting[str_key1][str_key2])
                                    for dict_tmp in dict_waiting[str_key1][str_key2]:
                                        str_tmp = '{0}, 車輛 {1}, {2}\r'.format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                                                                self.__convert_car_str(dict_tmp.get('refCar', '')), self.__convert_direction_str(str_direction))
                                        lst_history.append(str_tmp)
                                    dict_waiting[str_key1][str_key2] = []
                                    break
                            break

            str_data = '== 車輛通行記錄 ==\r'
            str_data += ''.join(lst_history)
            str_data += '\r'

            str_data += '== 等待區 ==\r'
            for str_key1, dict_value in dict_waiting.iteritems():
                str_data +=('{0}:\r'.format(self.__convert_location_str(str_key1)))
                for str_key2, lst_value in dict_value.iteritems():
                    str_output = ''
                    n_index = 0
                    for dict_value1 in lst_value:
                        if dict_value1.get('refCar', '') and dict_value1.get('arriveTime', ''):
                            if n_index >= 1:
                                str_output += '\r            '
                            str_output += '  車輛 {0}, {1}'.format(self.__convert_car_str(dict_value1.get('refCar', '')), dict_value1.get('arriveTime', ''))
                            n_index += 1
                    if not str_output:
                        str_output = '  N/A'
                    str_data +=('  {0}:{1}\r'.format(self.__convert_direction_str(str_key2), str_output))

            str_data += '\r'
            str_data += '== 行進車輛 ==\r'
            for str_key1, dict_value in dict_moving.iteritems():
                str_data +=('{0}:\r'.format(self.__convert_location_str(str_key1)))
                for str_key2, lst_value in dict_value.iteritems():
                    str_output = ''
                    n_index = 0
                    for dict_value1 in lst_value:
                        if n_index >= 1:
                            str_output += '\r            '
                        str_output += '  車輛 {0}'.format(self.__convert_car_str(dict_value1.get('refCar', '')))
                        n_index += 1
                    if not str_output:
                        str_output = '  N/A'
                    str_data +=('  {0}:{1}\r'.format(self.__convert_location_str(str_key2), str_output))
        return str_data, dict_waiting, lst_history

    def __countdown(self, n_type, str_ouput, n_delay):
        str_tmp = deepcopy(str_ouput)
        for n_times in range(0, n_delay, 1):
            n_delay-=1
            refresh_screen(n_type, str_tmp + '\r\r等待下次燈號轉換{0}(秒)\r'.format(n_delay))
            time.sleep(1)

    def __convert_direction(self, str_direction):
        str_key = ''

        if str_direction == 'straight':
            str_key = 'S'
        elif str_direction == 'right':
            str_key = 'R'
        elif str_direction == 'left':
            str_key = 'L'
        return str_key

    def __convert_direction_str(self, str_direction):
        str_key = ''

        if str_direction == 'S':
            str_key = '直行'
        elif str_direction == 'R':
            str_key = '右轉'
        elif str_direction == 'L':
            str_key = '左轉'
        return str_key

    def __convert_location(self, str_location):
        str_key = ''
        if str_location == 'top':
            str_key = 'N'
        elif str_location == 'bottom':
            str_key = 'S'
        elif str_location == 'right':
            str_key = 'E'
        elif str_location == 'left':
            str_key = 'W'
        return str_key

    def __convert_location_str(self, str_location):
        str_key = ''
        if str_location == 'N':
            str_key = '北向'
        elif str_location == 'S':
            str_key = '南向'
        elif str_location == 'E':
            str_key = '東向'
        elif str_location == 'W':
            str_key = '西向'
        return str_key

    def __convert_car_str(self, str_car):
        n_car = int(str_car)
        str_key = '%02d' %n_car
        return str_key

    def __refill_car_data(self, dict_car):
        dict_data = {'N':{'R':[], 'L':[], 'S':[]},
                     'S':{'R':[], 'L':[], 'S':[]},
                     'E':{'R':[], 'L':[], 'S':[]},
                     'W':{'R':[], 'L':[], 'S':[]}}
        if dict_car:
            for str_key1, dict_value1 in dict_car.iteritems():
                if str_key1 in ['top', 'bottom', 'right', 'left']:
                    str_location = self.__convert_location(str_key1)
                    for str_key2, dict_value2 in dict_value1.iteritems():
                        str_direction = self.__convert_direction(str_key2)
                        dict_data[str_location][str_direction] = dict_value2.get('queue', [])
        return dict_data

    def __get_moving_key(self, str_location, str_status):
        str_key = ''
        if str_location and str_status:
            if str_location == 'N':
                if str_status == 'S':
                    str_key = 'S'
                elif str_status == 'R':
                    str_key = 'W'
                elif str_status == 'L':
                    str_key = 'E'

            if str_location == 'S':
                if str_status == 'S':
                    str_key = 'N'
                elif str_status == 'R':
                    str_key = 'E'
                elif str_status == 'L':
                    str_key = 'W'

            if str_location == 'E':
                if str_status == 'S':
                    str_key = 'W'
                elif str_status == 'R':
                    str_key = 'N'
                elif str_status == 'L':
                    str_key = 'S'

            if str_location == 'W':
                if str_status == 'S':
                    str_key = 'E'
                elif str_status == 'R':
                    str_key = 'S'
                elif str_status == 'L':
                    str_key = 'N'
        return str_key


class CCallback(object):
    def __init__(self):
        self.obj_threadctrl = None

    def start(self):
        str_output = '計算中...'
        refresh_screen(1, str_output)
        refresh_screen(2, str_output)
        refresh_screen(3, str_output)

        # call rest api to retrieve new method for car information
        str_uri = self.__gen_uri('/operate/current?left='+sys.argv[1]+'&straight='+sys.argv[2]+'&right='+sys.argv[3]+'&car='+sys.argv[4]+'&lightHL='+sys.argv[5]+'&lightHS='+sys.argv[6]+'&lightVL='+sys.argv[7]+'&lightVS='+sys.argv[8])
        dict_new = self.__call_api(str_uri)
        # dict_new = self.__retrieve_new_data()

        # call rest api to retrieve compare information
        str_uri = self.__gen_uri('/compare/'+dict_new['output']['_id'])
        dict_compare = self.__call_api(str_uri)
        # dict_compare = self.__retrieve_compare_data()

        # call rest api to retrieve old information
        str_uri = self.__gen_uri('/normal/'+dict_compare['_id'])
        dict_old = self.__call_api(str_uri)
        # dict_old = self.__retrieve_old_data()

        dict_data = {'new': deepcopy(dict_new),
                     'old': deepcopy(dict_old),
                     'compare': deepcopy(dict_compare)}

        self.obj_threadctrl = CThreadCtrl()
        if self.obj_threadctrl:
            self.obj_threadctrl.start(dict_data)

    def stop(self):
        if messagebox.askokcancel("", "是否要離開?"):
            windows.destroy()
            if self.obj_threadctrl:
                self.obj_threadctrl.stop()

    def __gen_uri(self, str_key, str_id =''):
        str_uri = ''
        if str_key:
            str_uri = DEF_HOST + str_key
        if str_id:
            str_uri = DEF_HOST + '/' + str_id
        return str_uri

    def __call_api(self, str_uri):
        dict_header = {"Content-Type": "application/json"}

        obj_response = requests.get(str_uri, headers=dict_header, params={}, verify=False)
        if obj_response:
            n_result = obj_response.status_code
            if n_result == codes.ok:
                dict_response = json.loads(obj_response.content)
                return dict_response


    def __retrieve_new_data(self):
        dict_new = {
          "input": {
            "_id": "hiyhnuhyu",
            "top": {
              "straight": {
                "amount": 0,
                "queue": []
              },
              "left": {
                "amount": 0,
                "queue": []
              },
              "right": {
                "amount": 0,
                "queue": [
                  {}
                ]
              }
            },
            "left": {
              "straight": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "6",
                    "arriveTime": "2019-02-13T11:07:05.000Z"
                  },
                  {
                    "refCar": "9",
                    "arriveTime": "2019-02-13T11:07:05.000Z"
                  }
                ]
              },
              "left": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "7",
                    "arriveTime": "2019-02-13T11:07:06.000Z"
                  }
                ]
              },
              "right": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "8",
                    "arriveTime": "2019-02-13T11:07:08.000Z"
                  }
                ]
              }
            },
            "right": {
              "straight": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "5",
                    "arriveTime": "2019-02-13T11:07:04.000Z"
                  }
                ]
              },
              "left": {
                "amount": 0,
                "queue": []
              },
              "right": {
                "amount": 0,
                "queue": []
              }
            },
            "bottom": {
              "straight": {
                "amount": 0,
                "queue": []
              },
              "left": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "4",
                    "arriveTime": "2019-02-13T11:08:04.000Z"
                  }
                ]
              },
              "right": {
                "amount": 0,
                "queue": []
              }
            },
            "refIns": {
              "location": "台中市",
              "name": "中欽路",
              "waitZoneLength": 10,
              "lanes": 2
            }
          },
          "output":
            {
              "result": [
                {
                  "allow": [
                    {
                      "position": "left",
                      "direction": "straight"
                    },
                    {
                      "position": "left",
                      "direction": "left"
                    }
                  ],
                  "delay": 4
                },
                {
                  "allow": [
                    {
                      "position": "left",
                      "direction": "right"
                    }
                  ],
                  "delay": 3
                },
                {
                  "allow": [
                    {
                      "position": "right",
                      "direction": "straight"
                    }
                  ],
                  "delay": 2
                }
              ],
              "refCIns": "",
              "refCompare": ""
            }
        }
        return dict_new


    def __retrieve_old_data(self):
        dict_old = {
          "input": {
            "_id": "hiyhnuhyu",
            "top": {
              "straight": {
                "amount": 0,
                "queue": []
              },
              "left": {
                "amount": 0,
                "queue": []
              },
              "right": {
                "amount": 0,
                "queue": [
                  {}
                ]
              }
            },
            "left": {
              "straight": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "6",
                    "arriveTime": "2019-02-13T11:07:05.000Z"
                  }
                ]
              },
              "left": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "7",
                    "arriveTime": "2019-02-13T11:07:06.000Z"
                  }
                ]
              },
              "right": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "8",
                    "arriveTime": "2019-02-13T11:07:08.000Z"
                  }
                ]
              }
            },
            "right": {
              "straight": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "5",
                    "arriveTime": "2019-02-13T11:07:04.000Z"
                  }
                ]
              },
              "left": {
                "amount": 0,
                "queue": []
              },
              "right": {
                "amount": 0,
                "queue": []
              }
            },
            "bottom": {
              "straight": {
                "amount": 0,
                "queue": []
              },
              "left": {
                "amount": 0,
                "queue": [
                  {
                    "refCar": "4",
                    "arriveTime": "2019-02-13T11:08:04.000Z"
                  }
                ]
              },
              "right": {
                "amount": 0,
                "queue": []
              }
            },
            "refIns": {
              "location": "台中市",
              "name": "中欽路",
              "waitZoneLength": 10,
              "lanes": 2
            }
          },
          "output":
            {
              "result": [
                {
                  "allow": [
                    {
                      "position": "left",
                      "direction": "straight"
                    },
                    {
                      "position": "left",
                      "direction": "left"
                    }
                  ],
                  "delay": 5
                },
                {
                  "allow": [
                    {
                      "position": "left",
                      "direction": "right"
                    }
                  ],
                  "delay": 4
                },
                {
                  "allow": [
                    {
                      "position": "right",
                      "direction": "straight"
                    }
                  ],
                  "delay": 3
                }
              ],
              "refCIns": "",
              "refCompare": ""
            }
        }
        return dict_old


    def __retrieve_compare_data(self):
        dict_compare = {"_id": "hiyhnuhyu",
                            "normalInsTakenTime": 10,
                            "computerControledInsTakenTime": 8,
                            "refCIns":"",
                            "refResult": "",
                            "time": {
                                        "left": 0,
                                        "straight":1,
                                        "right":1,
                                        "car":1,
                                        "lights": {
                                            "horizontal": {
                                                "left":80,
                                                "straight":60,
                                                "right":60
                                            },
                                            "vertical": {
                                                "left":80,
                                                "straight":60,
                                                "right":60
                                            }
                                        }
                                    }
                                }
        return dict_compare



if __name__ == "__main__":
    windows = tk.Tk()
    windows.minsize(1150, 720)
    windows.geometry("1150x720")
    windows.title('')

    static_label = tk.Label(windows, text='', width=2)
    static_label.grid(row=0, column=0)

    old_label = tk.Label(windows, text='傳統式路口燈號控制', font=(None, DEF_FONT_SIZE), anchor=tk.NW, justify='left', width=DEF_WIDTH)
    old_label.grid(row=0, column=1)
    old_label2 = tk.Label(windows, text='計算中...', font=(None, DEF_FONT_SIZE), relief='solid', anchor=tk.NW, justify='left', width=DEF_WIDTH, height=DEF_HEIGHT)
    old_label2.grid(row=1, column=1)

    static_label2 = tk.Label(windows, text='', width=5)
    static_label2.grid(row=0, column=2)

    new_label = tk.Label(windows, text='平衡式路口燈號控制', font=(None, DEF_FONT_SIZE), anchor=tk.NW, justify='left', width=DEF_WIDTH)
    new_label.grid(row=0, column=3)
    new_label2 = tk.Label(windows, text='計算中...', font=(None, DEF_FONT_SIZE), relief='solid', anchor=tk.NW, justify='left', width=DEF_WIDTH, height=DEF_HEIGHT)
    new_label2.grid(row=1, column=3)

    static_label3 = tk.Label(windows, text='', width=5)
    static_label3.grid(row=0, column=4)

    compare_label = tk.Label(windows, text='比較結果', font=(None, DEF_FONT_SIZE), anchor=tk.NW, justify='left', width=DEF_WIDTH)
    compare_label.grid(row=0, column=5)
    compare_label2 = tk.Label(windows, text='計算中...', font=(None, DEF_FONT_SIZE), relief='solid', anchor=tk.NW, justify='left', width=DEF_WIDTH, height=DEF_HEIGHT)
    compare_label2.grid(row=1, column=5)

    obj_callback = CCallback()
    button=tk.Button(windows, text="開始", command=obj_callback.start, width=8, height=2)
    button.place(x=1080, y=20)
    windows.protocol("WM_DELETE_WINDOW", obj_callback.stop)
    windows.mainloop()
