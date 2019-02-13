# coding=utf8
import os
import json
import time
import requests
from copy import deepcopy
from requests import codes
from datetime import datetime
from colorama import init
from colorama import Back, Style


def call_api():
    dict_header = {"Content-Type": "application/json"}

    obj_response = requests.get('https://uc.ccsource.org/operate', headers=dict_header, params={}, verify=False)
    if obj_response:
        n_result = obj_response.status_code
        if n_result == codes.ok:
            dict_response = json.loads(obj_response.content)
    return dict_response


def convert_location(str_location):
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


def convert_direction(str_direction):
    str_key = ''

    if str_direction == 'straight':
        str_key = 'S'
    elif str_direction == 'right':
        str_key = 'R'
    elif str_direction == 'left':
        str_key = 'L'
    return str_key


def refill_car_data(dict_car):
    dict_data = {'N':{'R':[], 'L':[], 'S':[]},
                 'S':{'R':[], 'L':[], 'S':[]},
                 'E':{'R':[], 'L':[], 'S':[]},
                 'W':{'R':[], 'L':[], 'S':[]}}
    if dict_car:
        for str_key1, dict_value1 in dict_car.iteritems():
            if str_key1 in ['top', 'bottom', 'right', 'left']:
                str_location = convert_location(str_key1)
                for str_key2, dict_value2 in dict_value1.iteritems():
                    str_direction = convert_direction(str_key2)
                    dict_data[str_location][str_direction] = dict_value2.get('queue', [])
    return dict_data


def get_moving_key(str_location, str_status):
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


def output(dict_car, dict_light, lst_history):
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
                str_location = convert_location(dict_light_data.get('location', ''))
                str_direction = convert_direction(dict_light_data.get('direction', ''))
                if not str_location or not str_direction:
                    continue
                for str_key1, dict_value in dict_waiting.iteritems():
                    if str_location == str_key1:
                        for str_key2, lst_value in dict_value.iteritems():
                            if str_direction == str_key2:
                                str_move_direction = get_moving_key(str_location, str_direction)
                                dict_moving[str_location][str_move_direction] = deepcopy(dict_waiting[str_key1][str_key2])
                                for dict_tmp in dict_waiting[str_key1][str_key2]:
                                    str_tmp = '{0}, {1}, {2}\r\n'.format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), dict_tmp.get('refCar', ''), str_direction)
                                    lst_history.append(str_tmp)
                                dict_waiting[str_key1][str_key2] = []
                                break
                        break

        print '========== Pass Order ==================='
        print ''.join(lst_history)
        print '\r'

        print '========== Waiting ==================='
        for str_key1, dict_value in dict_waiting.iteritems():
            print('{0}:\r'.format(str_key1))
            for str_key2, lst_value in dict_value.iteritems():
                str_output = ''
                for dict_value1 in lst_value:
                    if dict_value1.get('refCar', '') and dict_value1.get('arriveTime', ''):
                        str_output += '  ({0}, {1})'.format(dict_value1.get('refCar', ''), dict_value1.get('arriveTime', ''))
                if not str_output:
                    str_output = '  N/A'
                print(' {0}:{1}'.format(str_key2, str_output))

        print '************ Moving *****************'
        for str_key1, dict_value in dict_moving.iteritems():
            print('{0}:\r'.format(str_key1))
            for str_key2, lst_value in dict_value.iteritems():
                str_output = ''
                for dict_value1 in lst_value:
                    str_output += '  {0}'.format(dict_value1.get('refCar', ''))
                if not str_output:
                    str_output = '  N/A'
                print(' {0}:{1}'.format(str_key2, str_output))
    return dict_waiting, lst_history


def countdown(n_delay):
    import sys
    for n_times in range(0, n_delay, 1):
        n_delay-=1
        #sys.stdout.write('{0}s\r'.format(n_delay))
        sys.stdout.write(Back.RED + 'Waiting for next turn of changing lights {0} second(s)\r'.format(n_delay))
        sys.stdout.flush()
        time.sleep(1)
    print(Style.RESET_ALL)


def refresh_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


if __name__ == "__main__":
    lst_history = []

    # init color
    init()

    # call rest api
    #dict_response = call_api()
    dict_data = {
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
            "queue": [{
                    "refCar": "4",
                    "arriveTime": "2019-02-13T11:08:04.000Z"
                  }]
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
      "output": [
        {
          "allow": [
            {
              "location": "left",
              "direction": "straight"
            },
            {
              "location": "left",
              "direction": "left"
            }
          ],
          "delay": 5
        },
        {
          "allow": [
            {
              "location": "left",
              "direction": "right"
            }
          ],
          "delay": 3
        }
        ,
        {
          "allow": [
            {
              "location": "right",
              "direction": "straight"
            }
          ],
          "delay": 4
        }
      ]
    }

    # refill car data
    dict_car = refill_car_data(dict_data.get('input', {}))
    dict_tmp = deepcopy(dict_car)

    # printout car information
    output(dict_car,[], lst_history)
    time.sleep(5)
    refresh_screen()

    # wait for light transformation
    for n_index, dict_output_data in enumerate(dict_data.get('output', [])):
        # return car information
        if dict_tmp:
            dict_tmp, lst_history = output(dict_tmp, dict_output_data, lst_history)

            # countdown
            n_delay = dict_output_data.get('delay', 0)
            print '\r'
            countdown(n_delay)

        # refresh screen
        if n_index != len(dict_data['output']) - 1:
            refresh_screen()
