def data_parser (data, device_name):
    if device_name == 'Crenot Gofit S2':
        weight = round((int(data.hex()[13:18], 16) - 524288) / 1000, 2)
        return weight
    else:
        weight = int.from_bytes(data[1:3], byteorder = 'little')/200
        return weight