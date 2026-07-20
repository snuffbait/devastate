class HuffmanNode {
    constructor() {
        this.weight = 0;
        this.bitNum = 0;
        this.bitArray = new Uint32Array(32);
        this.index = 0;
        this.parentNode = -1;
        this.childNode = new Int32Array([-1, -1]);
    }
}

class BitStream {
    constructor() {
        this.buffer = null; // Uint8Array
        this.bytes = 0;
        this.bits = 0;
    }
}

function bitStreamInit(buffer, isRead) {
    let bs = new BitStream();
    bs.buffer = buffer;
    bs.bytes = 0;
    bs.bits = 0;
    if (!isRead) bs.buffer[0] = 0;
    return bs;
}

function bitStreamRead(bs, bitNum) {
    let result = 0;
    for (let i = 0; i < bitNum; i++) {
        result = result | (((bs.buffer[bs.bytes] >> (7 - bs.bits)) & 1) << (bitNum - 1 - i));
        bs.bits++;
        if (bs.bits === 8) {
            bs.bytes++;
            bs.bits = 0;
        }
    }
    return result >>> 0; // force unsigned
}

function bitStreamGetBytes(bs) {
    if (bs.bits !== 0) return bs.bytes + 1;
    return bs.bytes;
}

function huffmanDecode(press, dest = null) {
    let node = Array.from({length: 256 + 255}, () => new HuffmanNode());
    let weight = new Uint16Array(256);
    
    let bs = bitStreamInit(press, true);
    let originalSize = bitStreamRead(bs, (bitStreamRead(bs, 6) + 1) % 256);
    let pressSize = bitStreamRead(bs, (bitStreamRead(bs, 6) + 1) % 256);
    
    let bitNum = (bitStreamRead(bs, 3) + 1) * 2;
    let minus = bitStreamRead(bs, 1);
    let saveData = bitStreamRead(bs, bitNum);
    weight[0] = saveData;
    
    for (let i = 1; i < 256; i++) {
        bitNum = (bitStreamRead(bs, 3) + 1) * 2;
        minus = bitStreamRead(bs, 1);
        saveData = bitStreamRead(bs, bitNum);
        if (minus === 1) {
            weight[i] = (weight[i - 1] - saveData) & 0xFFFF;
        } else {
            weight[i] = (weight[i - 1] + saveData) & 0xFFFF;
        }
    }
    
    let headSize = bitStreamGetBytes(bs);
    
    if (!dest) return originalSize;
    
    for (let i = 0; i < 256 + 255; i++) {
        node[i].weight = (i < 256) ? weight[i] : 0;
        node[i].childNode[0] = -1;
        node[i].childNode[1] = -1;
        node[i].parentNode = -1;
    }
    
    let dataNum = 256;
    let nodeNum = 256;
    while (dataNum > 1) {
        let minNode1 = -1;
        let minNode2 = -1;
        
        for (let i = 0, nodeIndex = 0; i < dataNum; nodeIndex++) {
            if (node[nodeIndex].parentNode !== -1) continue;
            
            i++;
            
            if (minNode1 === -1 || node[minNode1].weight > node[nodeIndex].weight) {
                minNode2 = minNode1;
                minNode1 = nodeIndex;
            } else {
                if (minNode2 === -1 || node[minNode2].weight > node[nodeIndex].weight) {
                    minNode2 = nodeIndex;
                }
            }
        }
        
        node[nodeNum].parentNode = -1;
        node[nodeNum].weight = node[minNode1].weight + node[minNode2].weight;
        node[nodeNum].childNode[0] = minNode1;
        node[nodeNum].childNode[1] = minNode2;
        
        node[minNode1].index = 0;
        node[minNode2].index = 1;
        node[minNode1].parentNode = nodeNum;
        node[minNode2].parentNode = nodeNum;
        
        nodeNum++;
        dataNum--;
    }
    
    let tempBitArray = new Uint8Array(32);
    for (let i = 0; i < 256 + 254; i++) {
        node[i].bitNum = 0;
        let tempBitIndex = 0;
        let tempBitCount = 0;
        tempBitArray[tempBitIndex] = 0;
        
        let nodeIndex = i;
        while (node[nodeIndex].parentNode !== -1) {
            if (tempBitCount === 8) {
                tempBitCount = 0;
                tempBitIndex++;
                tempBitArray[tempBitIndex] = 0;
            }
            tempBitArray[tempBitIndex] <<= 1;
            tempBitArray[tempBitIndex] |= node[nodeIndex].index & 0xFF;
            tempBitCount++;
            node[i].bitNum++;
            nodeIndex = node[nodeIndex].parentNode;
        }
        
        let bitCount = 0;
        let bitIndex = 0;
        node[i].bitArray[bitIndex] = 0;
        
        while (tempBitIndex >= 0) {
            if (bitCount === 8) {
                bitCount = 0;
                bitIndex++;
                node[i].bitArray[bitIndex] = 0;
            }
            node[i].bitArray[bitIndex] |= ((tempBitArray[tempBitIndex] & 1) << bitCount) & 0xFF;
            tempBitArray[tempBitIndex] >>= 1;
            tempBitCount--;
            if (tempBitCount === 0) {
                tempBitIndex--;
                tempBitCount = 8;
            }
            bitCount++;
        }
    }
    
    let nodeIndexTable = new Int32Array(512).fill(-1);
    let bitMask = new Uint16Array(9);
    for (let i = 0; i < 9; i++) {
        bitMask[i] = (1 << (i + 1)) - 1;
    }
    
    for (let i = 0; i < 512; i++) {
        for (let j = 0; j < 256 + 254; j++) {
            if (node[j].bitNum > 9) continue;
            let bitArray01 = node[j].bitArray[0] | (node[j].bitArray[1] << 8);
            if ((i & bitMask[node[j].bitNum - 1]) === (bitArray01 & bitMask[node[j].bitNum - 1])) {
                nodeIndexTable[i] = j;
                break;
            }
        }
    }
    
    let pressData = press.subarray(headSize);
    let destSizeCounter = 0;
    let pressSizeCounter = 0;
    let pressBitCounter = 0;
    let pressBitData = pressData[pressSizeCounter];
    
    for (destSizeCounter = 0; destSizeCounter < originalSize; destSizeCounter++) {
        let nodeIndex;
        if (destSizeCounter >= originalSize - 17) {
            nodeIndex = 510;
        } else {
            if (pressBitCounter === 8) {
                pressSizeCounter++;
                pressBitData = pressData[pressSizeCounter];
                pressBitCounter = 0;
            }
            let tmp1 = pressData[pressSizeCounter + 1];
            pressBitData = (pressBitData | (tmp1 << (8 - pressBitCounter))) & 0x1FF;
            nodeIndex = nodeIndexTable[pressBitData];
            
            pressBitCounter += node[nodeIndex].bitNum;
            if (pressBitCounter >= 16) {
                pressSizeCounter += 2;
                pressBitCounter -= 16;
                pressBitData = pressData[pressSizeCounter] >> pressBitCounter;
            } else if (pressBitCounter >= 8) {
                pressSizeCounter++;
                pressBitCounter -= 8;
                pressBitData = pressData[pressSizeCounter] >> pressBitCounter;
            } else {
                pressBitData >>= node[nodeIndex].bitNum;
            }
        }
        
        while (nodeIndex > 255) {
            if (pressBitCounter === 8) {
                pressSizeCounter++;
                pressBitData = pressData[pressSizeCounter];
                pressBitCounter = 0;
            }
            let index = pressBitData & 1;
            pressBitData >>= 1;
            pressBitCounter++;
            nodeIndex = node[nodeIndex].childNode[index];
        }
        dest[destSizeCounter] = nodeIndex;
    }
    
    return [dest, originalSize];
}
if (typeof module !== 'undefined') { module.exports = { huffmanDecode }; }
