import { _decorator, Component, find, isValid, Node,game, director, sys, tween, Vec3, Tween, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Utils')
export class Utils extends Component {

    private static Instance: Utils;

    protected onLoad(): void {
        if( Utils.Instance === null ){
            Utils.Instance = this;
        }
        else{
            this.destroy();
            return;
        }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    /**
     * 快捷查找节点（支持路径）
     * @param path 节点路径 如 Canvas/UI/Panel
     */
    static findNode(path: string): Node | null {
        return find(path);
    }

     /**
     * 递归查找子节点（根据名字）
     */
    static findChildByName(parent: Node, name: string): Node | null {
        if (!parent || !name) return null;
        if (parent.name === name) return parent;
        for (const child of parent.children) {
            const ret = this.findChildByName(child, name);
            if (ret) return ret;
        }
        return null;
    }

    // ================================
    // 随机数
    // ================================
    static random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ================================
    // 9. 平台判断
    // ================================
    static isAndroid() { return sys.platform === sys.Platform.ANDROID; }
    static isIOS() { return sys.platform === sys.Platform.IOS; }
    static isMobile() { return sys.isMobile; }

    // ================================
    // ✅ 货币格式化（从Lua完美移植）
    // ================================
    /**
     * 货币数字格式化 K/M/B/T
     * @param coins 数值
     * @param obligate 限制显示位数
     * @param notCut 不显示千分位逗号
     * @param normal 保留小数模式
     * @param noRounding 不四舍五入（向下取整）
     */
    static util_formatCoins(
        coins: number | string,
        obligate: number,
        notCut?: boolean,
        normal?: boolean,
        noRounding?: boolean
    ): string {
        const obK = Math.pow(10, 3);
        let numCoins = typeof coins === 'number' ? coins : parseFloat(coins);
        if (isNaN(numCoins)) return String(coins);
        if (obligate < 1) return numCoins.toString();

        const isCut = !notCut;
        numCoins += 0.00001;
        const nCoins = Math.floor(numCoins);
        let count = nCoins === 0 ? 1 : Math.floor(Math.log10(nCoins)) + 1;

        if (count <= obligate) {
            return this.util_cutCoins(nCoins, isCut, 0, noRounding);
        } else {
            if (count < 3) {
                return this.util_cutCoins(nCoins / obK, isCut, 0, noRounding) + "K";
            } else {
                let tCoins = nCoins;
                const units = ["K", "M", "B", "T"];
                const cell = 1000;
                let index = 0;

                while (true) {
                    index++;
                    if (index > 4) {
                        return this.util_cutCoins(tCoins, isCut, 0, noRounding) + units[3];
                    }
                    tCoins /= cell;
                    const num = tCoins === 0 ? 1 : Math.floor(Math.log10(tCoins)) + 1;

                    if (num <= obligate) {
                        let floatNum = obligate - num;
                        if (normal) {
                            return this.util_cutCoins(tCoins, isCut, floatNum, noRounding) + units[index - 1];
                        }
                        if (num === 1 && floatNum > 0) {
                            floatNum = 1;
                        } else {
                            floatNum = 0;
                        }
                        return this.util_cutCoins(tCoins, isCut, floatNum, noRounding) + units[index - 1];
                    }
                }
            }
        }
    }

    /**
     * 内部：数字切割、小数、千分位
     */
    private static util_cutCoins(
        num: number,
        isCut: boolean,
        floatNum: number = 0,
        noRounding: boolean = false
    ): string {
        let result: number;
        if (noRounding) {
            const p = Math.pow(10, floatNum);
            result = Math.floor(num * p) / p;
        } else {
            result = num;
        }

        let str = floatNum > 0 ? result.toFixed(floatNum) : Math.floor(result).toString();

        if (isCut) {
            str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return str;
    }

    // 延迟执行
    public static performWithDelay (node:Node,func:Function,time:number){
        if (!node || !node.isValid) {
            console.warn("performWithDelay：节点无效，取消延迟");
            return null;
        }
        return tween(node).delay(time).call(()=>{
            // 执行前再判一次有效
            if (node && node.isValid) {
                if( func ){
                    func();
                }
            }
        }).start();
    };

    
    /**
     * 自定义 JumpTo
     * @param target 目标节点
     * @param duration 总时长
     * @param endPos 终点坐标
     * @param height 最大跳跃高度
     * @param jumps 跳跃次数（一般 1）
     */
    public static jumpTo(
        target: Node,
        duration: number,
        endPos: Vec3,
        height: number,
        jumps: number = 1
    ) {
        const startPos = target.worldPosition.clone();

        return tween(target)
            .to(duration, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    // 水平插值
                    const x = startPos.x + (endPos.x - startPos.x) * ratio;
                    const z = startPos.z + (endPos.z - startPos.z) * ratio;

                    // 垂直跳跃（正弦波）
                    const jumpRatio = Math.sin(ratio * Math.PI * jumps);
                    const y = startPos.y + (endPos.y - startPos.y) * ratio + height * jumpRatio;

                    target.setWorldPosition(x, y, z);
                }
            });
    }

    /**
     * 二次贝塞尔曲线 获取 t 时刻的坐标点
     * @param t 0~1 进度
     * @param start 起点
     * @param control 控制点
     * @param end 终点
     */
    public static getQuadraticPoint(t: number, start: Vec3, control: Vec3, end: Vec3): Vec3 {
        const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x;
        const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y;
        const z = (1 - t) ** 2 * start.z + 2 * (1 - t) * t * control.z + t ** 2 * end.z;
        return new Vec3(x, y, z);
    }

    /**
     * 开始二次贝塞尔运动 【修复版】
     */
    public static startQuadraticBezierMove(
        node: Node,
        duration: number,
        startPos: Vec3,
        controlPoint: Vec3,
        endPos: Vec3,
        callback?: Function
    ) {
        tween<{ t: number }>({ t: 0 })
            .to(duration, { t: 1 }, {
                onUpdate: (target) => {
                    const pos = this.getQuadraticPoint(
                        target.t,
                        startPos,
                        controlPoint,
                        endPos
                    );
                    node.setPosition(pos);
                }
            })
            .call(() => callback?.())
            .start();
    }
}


