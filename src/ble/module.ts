import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class BleModule {
  public bluetoothState: 'on' | 'off';
  public isConnecting: boolean;
  public peripheralId: string | undefined;
  public writeWithResponseCharacteristicUUID: Array<string> | undefined;
  public writeWithoutResponseCharacteristicUUID: Array<string> | undefined;
  public readCharacteristicUUID: Array<string> | undefined;
  public nofityCharacteristicUUID: Array<string> | undefined;
  public readServiceUUID: Array<string> | undefined;
  public writeWithResponseServiceUUID: Array<string> | undefined;
  public writeWithoutResponseServiceUUID: Array<string> | undefined;
  public nofityServiceUUID: Array<string> | undefined;

  constructor() {
    this.isConnecting = false; //蓝牙是否连接
    this.bluetoothState = 'off'; //蓝牙打开状态
    this.initUUID();
  }

  /**
   * 添加监听器
   * 所有监听事件如下
   * BleManagerStopScan：扫描结束监听
   * BleManagerDiscoverPeripheral：扫描到一个新设备
   * BleManagerDidUpdateState：蓝牙状态改变
   * BleManagerDidUpdateValueForCharacteristic：接收到新数据
   * BleManagerConnectPeripheral：蓝牙设备已连接
   * BleManagerDisconnectPeripheral：蓝牙设备已断开连接
   * */
  addListener(eventType: string, listener: (...args: any[]) => any) {
    return bleManagerEmitter.addListener(eventType, listener);
  }

  removeListener(eventType: string, listener: (...args: any[]) => any) {
    bleManagerEmitter.removeListener(eventType, listener);
  }

  /**
   * 初始化蓝牙模块
   * Init the module.
   * */
  start() {
    BleManager.start({ showAlert: false })
      .then(() => {
        this.checkState();
        console.log('Init the module success.');
      })
      .catch(() => {
        console.log('Init the module fail.');
      });
  }

  /**
   * 强制检查蓝牙状态
   * Force the module to check the state of BLE and trigger a BleManagerDidUpdateState event.
   * */
  checkState() {
    BleManager.checkState();
  }

  /**
   * 扫描可用设备，5秒后结束
   * Scan for availables peripherals.
   * */
  scan() {
    return new Promise((resolve, reject) => {
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scan started');
          resolve();
        })
        .catch((err) => {
          console.log('Scan started fail');
          reject(err);
        });
    });
  }

  /**
   * 停止扫描
   * Stop the scanning.
   * */
  stopScan() {
    BleManager.stopScan()
      .then(() => {
        console.log('Scan stopped');
      })
      .catch((err) => {
        console.log('Scan stopped fail', err);
      });
  }

  /**
   * 返回扫描到的蓝牙设备
   * Return the discovered peripherals after a scan.
   * */
  getDiscoveredPeripherals() {
    return new Promise((resolve) => {
      BleManager.getDiscoveredPeripherals().then((peripheralsArray) => {
        console.log('Discovered peripherals: ', peripheralsArray);
        resolve(peripheralsArray);
      });
    });
  }

  /**
   * Converts UUID to full 128bit.
   * @returns UUID 128bit UUID.
   */
  fullUUID(uuid: string) {
    if (uuid.length === 4) {
      return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    if (uuid.length === 8) {
      return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    return uuid.toUpperCase();
  }

  initUUID() {
    this.readServiceUUID = [];
    this.readCharacteristicUUID = [];
    this.writeWithResponseServiceUUID = [];
    this.writeWithResponseCharacteristicUUID = [];
    this.writeWithoutResponseServiceUUID = [];
    this.writeWithoutResponseCharacteristicUUID = [];
    this.nofityServiceUUID = [];
    this.nofityCharacteristicUUID = [];
  }

  //获取Notify、Read、Write、WriteWithoutResponse的serviceUUID和characteristicUUID
  getUUID(peripheralInfo: any) {
    this.readServiceUUID = [];
    this.readCharacteristicUUID = [];
    this.writeWithResponseServiceUUID = [];
    this.writeWithResponseCharacteristicUUID = [];
    this.writeWithoutResponseServiceUUID = [];
    this.writeWithoutResponseCharacteristicUUID = [];
    this.nofityServiceUUID = [];
    this.nofityCharacteristicUUID = [];
    for (let item of peripheralInfo.characteristics) {
      item.service = this.fullUUID(item.service);
      item.characteristic = this.fullUUID(item.characteristic);
      if (Platform.OS === 'android') {
        if (item.properties.Notify === 'Notify') {
          this.nofityServiceUUID.push(item.service);
          this.nofityCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.Read === 'Read') {
          this.readServiceUUID.push(item.service);
          this.readCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.Write === 'Write') {
          this.writeWithResponseServiceUUID.push(item.service);
          this.writeWithResponseCharacteristicUUID.push(item.characteristic);
        }
        if (item.properties.WriteWithoutResponse === 'WriteWithoutResponse') {
          this.writeWithoutResponseServiceUUID.push(item.service);
          this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
        }
      } else {
        //ios
        for (let property of item.properties) {
          if (property === 'Notify') {
            this.nofityServiceUUID.push(item.service);
            this.nofityCharacteristicUUID.push(item.characteristic);
          }
          if (property === 'Read') {
            this.readServiceUUID.push(item.service);
            this.readCharacteristicUUID.push(item.characteristic);
          }
          if (property === 'Write') {
            this.writeWithResponseServiceUUID.push(item.service);
            this.writeWithResponseCharacteristicUUID.push(item.characteristic);
          }
          if (property === 'WriteWithoutResponse') {
            this.writeWithoutResponseServiceUUID.push(item.service);
            this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
          }
        }
      }
    }
    console.log('readServiceUUID', this.readServiceUUID);
    console.log('readCharacteristicUUID', this.readCharacteristicUUID);
    console.log('writeWithResponseServiceUUID', this.writeWithResponseServiceUUID);
    console.log('writeWithResponseCharacteristicUUID', this.writeWithResponseCharacteristicUUID);
    console.log('writeWithoutResponseServiceUUID', this.writeWithoutResponseServiceUUID);
    console.log(
      'writeWithoutResponseCharacteristicUUID',
      this.writeWithoutResponseCharacteristicUUID,
    );
    console.log('nofityServiceUUID', this.nofityServiceUUID);
    console.log('nofityCharacteristicUUID', this.nofityCharacteristicUUID);
  }

  /**
   * 连接蓝牙
   * Attempts to connect to a peripheral.
   * */
  connect(id: string) {
    this.isConnecting = true; //当前蓝牙正在连接中
    return new Promise((resolve, reject) => {
      BleManager.connect(id)
        .then(() => {
          console.log('Connected success.');
          return BleManager.retrieveServices(id);
        })
        .then((peripheralInfo: any) => {
          console.log('Connected peripheralInfo: ', peripheralInfo);
          this.peripheralId = peripheralInfo.id;
          this.getUUID(peripheralInfo);
          this.isConnecting = false; //当前蓝牙连接结束
          resolve(peripheralInfo);
        })
        .catch((error) => {
          console.log('Connected error:', error);
          this.isConnecting = false; //当前蓝牙连接结束
          reject(error);
        });
    });
  }

  /**
   * 断开蓝牙连接
   * Disconnect from a peripheral.
   * */
  disconnect() {
    BleManager.disconnect(this.peripheralId as string)
      .then(() => {
        console.log('Disconnected');
      })
      .catch((error) => {
        console.log('Disconnected error:', error);
      });
  }

  /**
   * 打开通知
   * Start the notification on the specified characteristic.
   * */
  startNotification(index = 0) {
    return new Promise((resolve, reject) => {
      if (!this.nofityServiceUUID) {
        return;
      }
      if (!this.nofityCharacteristicUUID) {
        return;
      }
      BleManager.startNotification(
        this.peripheralId as string,
        this.nofityServiceUUID[index],
        this.nofityCharacteristicUUID[index],
      )
        .then(() => {
          console.log('Notification started');
          resolve();
        })
        .catch((error) => {
          console.log('Notification error:', error);
          reject(error);
        });
    });
  }

  /**
   * 关闭通知
   * Stop the notification on the specified characteristic.
   * */
  stopNotification(index = 0) {
    if (!this.nofityServiceUUID) {
      return;
    }
    if (!this.nofityCharacteristicUUID) {
      return;
    }
    BleManager.stopNotification(
      this.peripheralId as string,
      this.nofityServiceUUID[index],
      this.nofityCharacteristicUUID[index],
    )
      .then(() => {
        console.log('stopNotification success!');
      })
      .catch((error) => {
        console.log('stopNotification error:', error);
      });
  }

  /**
   * 写数据到蓝牙
   * 参数：(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize)
   * Write with response to the specified characteristic, you need to call retrieveServices method before.
   * */
  write(data: string, index = 0) {
    // data = this.addProtocol(data);   //在数据的头尾加入协议格式，如0A => FEFD010AFCFB，不同的蓝牙协议应作相应的更改
    return new Promise((resolve, reject) => {
      if (!this.writeWithResponseServiceUUID) {
        return;
      }
      if (!this.writeWithResponseCharacteristicUUID) {
        return;
      }
      BleManager.write(
        this.peripheralId as string,
        this.writeWithResponseServiceUUID[index],
        this.writeWithResponseCharacteristicUUID[index],
        data,
      )
        .then(() => {
          console.log('Write success: ', data.toString());
          resolve();
        })
        .catch((error) => {
          console.log('Write  failed: ', data);
          reject(error);
        });
    });
  }

  /**
   * 写数据到蓝牙，没有响应
   * 参数：(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize)
   * Write without response to the specified characteristic, you need to call retrieveServices method before.
   * */
  writeWithoutResponse(data: string, index = 0) {
    return new Promise((resolve, reject) => {
      if (!this.writeWithoutResponseServiceUUID) {
        return;
      }
      if (!this.writeWithoutResponseCharacteristicUUID) {
        return;
      }
      BleManager.writeWithoutResponse(
        this.peripheralId as string,
        this.writeWithoutResponseServiceUUID[index],
        this.writeWithoutResponseCharacteristicUUID[index],
        data,
      )
        .then(() => {
          console.log('Write success: ', data);
          resolve();
        })
        .catch((error) => {
          console.log('Write  failed: ', data);
          reject(error);
        });
    });
  }

  /**
   * 读取数据
   * Read the current value of the specified characteristic, you need to call retrieveServices method before
   * */
  read(index = 0) {
    return new Promise((resolve, reject) => {
      if (!this.readServiceUUID) {
        return;
      }
      if (!this.readCharacteristicUUID) {
        return;
      }
      BleManager.read(
        this.peripheralId as string,
        this.readServiceUUID[index],
        this.readCharacteristicUUID[index],
      )
        .then((data) => {
          const str = this.byteToString(data);
          console.log('Read: ', data, str);
          resolve(str);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /**
   * 返回已连接的蓝牙设备
   * Return the connected peripherals.
   * */
  getConnectedPeripherals() {
    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      console.log('Connected peripherals: ', peripheralsArray);
    });
  }

  /**
   * 判断指定设备是否已连接
   * Check whether a specific peripheral is connected and return true or false
   */
  isPeripheralConnected() {
    return new Promise((resolve, reject) => {
      BleManager.isPeripheralConnected(this.peripheralId as string, [])
        .then((isConnected) => {
          resolve(isConnected);
          if (isConnected) {
            console.log('Peripheral is connected!');
          } else {
            console.log('Peripheral is NOT connected!');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 蓝牙接收的信号强度
   * Read the current value of the RSSI
   * */
  readRSSI(id: string) {
    return new Promise((resolve, reject) => {
      BleManager.readRSSI(id)
        .then((rssi) => {
          console.log(id, 'RSSI: ', rssi);
          resolve(rssi);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /**
   * 打开蓝牙(Android only)
   * Create the request to the user to activate the bluetooth
   * */
  enableBluetooth() {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('The bluetooh is already enabled or the user confirm');
      })
      .catch(() => {
        console.log('The user refuse to enable bluetooth');
      });
  }

  /**
   * Android only
   * 开启一个绑定远程设备的进程
   * Start the bonding (pairing) process with the remote device
   * */
  createBond() {
    if (this.peripheralId != null) {
      BleManager.createBond(this.peripheralId)
        .then(() => {
          console.log('createBond success or there is already an existing one');
        })
        .catch(() => {
          console.log('fail to bond');
        });
    }
  }

  /**
   * Android only
   * 获取已绑定的设备
   * Return the bonded peripherals
   * */
  getBondedPeripherals() {
    BleManager.getBondedPeripherals().then((bondedPeripheralsArray) => {
      // Each peripheral in returned array will have id and name properties
      console.log('Bonded peripherals: ' + bondedPeripheralsArray);
    });
  }

  /**
   * 在已绑定的缓存列表中移除设备
   * Removes a disconnected peripheral from the cached list.
   * It is useful if the device is turned off,
   * because it will be re-discovered upon turning on again
   * */
  removePeripheral() {
    return new Promise((resolve, reject) => {
      if (this.peripheralId != null) {
        BleManager.removePeripheral(this.peripheralId)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  /**
   * 添加蓝牙协议格式，包头、数据长度、包尾，不同的蓝牙协议应作相应的更改
   * 0A => FEFD010AFCFB
   * */
  addProtocol(data: string) {
    return 'FEFD' + this.getHexByteLength(data) + data + 'FCFB';
  }

  /**
   * 计算十六进制数据长度，每两位为1个长度，返回十六进制长度
   * */
  getHexByteLength(str: string) {
    let length = parseInt(String(str.length / 2));
    return this.addZero(length.toString(16));
  }

  /**
   * 在字符串前面添加 0, 默认补充为2位
   * */
  addZero(str: string, bit = 2) {
    for (let i = str.length; i < bit; i++) {
      str = '0' + str;
    }
    return str;
  }

  /**
   * ios系统从蓝牙广播信息中获取蓝牙MAC地址
   * */
  getMacAddressFromIOS(data: any) {
    let macAddressInAdvertising = data.advertising.kCBAdvDataManufacturerMacAddress;
    //为undefined代表此蓝牙广播信息里不包括Mac地址
    if (!macAddressInAdvertising) {
      return;
    }
    macAddressInAdvertising = macAddressInAdvertising
      .replace('<', '')
      .replace('>', '')
      .replace(' ', '');
    if (macAddressInAdvertising != null && macAddressInAdvertising !== '') {
      macAddressInAdvertising = this.swapEndianWithColon(macAddressInAdvertising);
    }
    return macAddressInAdvertising;
  }

  /**
   * ios从广播中获取的mac地址进行大小端格式互换，并加上冒号:
   * @returns string       80:EA:CA:00:00:01
   * @param str
   * */
  swapEndianWithColon(str: string) {
    let format = '';
    let len = str.length;
    for (let j = 2; j <= len; j = j + 2) {
      format += str.substring(len - j, len - (j - 2));
      if (j !== len) {
        format += ':';
      }
    }
    return format.toUpperCase();
  }

  /**
   * 字符串转换成byte数组
   */
  stringToByte(str: string) {
    const bytes = [];
    let len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10ffff) {
        bytes.push(((c >> 18) & 0x07) | 0xf0);
        bytes.push(((c >> 12) & 0x3f) | 0x80);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00ffff) {
        bytes.push(((c >> 12) & 0x0f) | 0xe0);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007ff) {
        bytes.push(((c >> 6) & 0x1f) | 0xc0);
        bytes.push((c & 0x3f) | 0x80);
      } else {
        bytes.push(c & 0xff);
      }
    }
    return bytes;
  }

  /**
   * byte数组转换成字符串
   */
  byteToString(arr: Buffer | string) {
    if (typeof arr === 'string') {
      return arr;
    }
    let str = '',
      _arr = arr;
    for (let i = 0; i < _arr.length; i++) {
      let one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if (v && one.length === 8) {
        let bytesLength = v[0].length;
        let store = _arr[i].toString(2).slice(7 - bytesLength);
        for (let st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  }
}
