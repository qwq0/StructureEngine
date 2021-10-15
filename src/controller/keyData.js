/**
 * 按键数据
 * 当发生键盘事件时传递
 * 包含按键和按下状态等数据
 */
export class keyData
{
    key = ""; // 键名
    hold = false; // 当前此指针是否处于按下状态
    pressing = false; // 当前指针是否正在按下(按下事件)
    constructor(key, hold, pressing)
    {
        this.key = key;
        this.hold = hold;
        this.pressing = pressing;
    }
}