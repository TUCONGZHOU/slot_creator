import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

// 定义回调函数的类型（支持任意参数、无返回值）
type EventCallback = (...args: any[]) => void;

// 单个订阅项的包装类型（记录回调、上下文、是否单次执行）
interface EventListener {
    callback: EventCallback; // 回调函数
    ctx: any;               // 执行上下文（this）
    isOnce: boolean;        // 是否为单次订阅
}

@ccclass('GlEventMgr')
export class GlEventMgr extends Component {

    // 单例实例
    public static Instance: GlEventMgr | null = null;
    // 消息映射表：key=消息名，value=该消息的所有订阅回调
    private _eventMap: Map<string, EventListener[]> = new Map();

    // 单例获取方法（全局唯一）
    protected onLoad(): void {
        if( GlEventMgr.Instance === null ){
            GlEventMgr.Instance = this;
        }
        else{
            this.destroy();
            return;
        }
    }

    /**
     * 订阅消息
     * @param eventName 消息名（自定义，建议用常量管理）
     * @param callback 回调函数（支持任意参数）
     * @param ctx 执行上下文（当前脚本的this，必传，否则this指向丢失）
     * @param isOnce 是否单次执行（默认false，true则执行后自动取消订阅）
     */
    public on(eventName: string, callback: EventCallback, ctx: any, isOnce: boolean = false): void {
        // 边界处理：空回调/空上下文直接返回
        if (!callback || !ctx) {
            console.warn(`[GlobalEvent] 订阅失败：消息${eventName}的回调或上下文不能为空`);
            return;
        }
        // 若消息未注册，初始化回调数组
        if (!this._eventMap.has(eventName)) {
            this._eventMap.set(eventName, []);
        }
        const listeners = this._eventMap.get(eventName)!;
        // 避免重复订阅（同一消息+同一回调+同一上下文）
        const isRepeat = listeners.some(item => 
            item.callback === callback && item.ctx === ctx
        );
        if (isRepeat) {
            console.warn(`[GlobalEvent] 消息${eventName}已重复订阅，跳过`);
            return;
        }
        // 添加订阅项
        listeners.push({ callback, ctx, isOnce });
    }

    /**
     * 单次订阅消息（执行一次后自动取消）
     * @param eventName 消息名
     * @param callback 回调函数
     * @param ctx 执行上下文
     */
    public once(eventName: string, callback: EventCallback, ctx: any): void {
        this.on(eventName, callback, ctx, true);
    }

    /**
     * 发布消息（触发订阅的回调）
     * @param eventName 消息名
     * @param args 传递的参数（任意个数、任意类型）
     */
    public emit(eventName: string, ...args: any[]): void {
        const listeners = this._eventMap.get(eventName);
        // 无订阅的消息直接返回
        if (!listeners || listeners.length === 0) {
            return;
        }
        // 浅拷贝数组（避免执行中取消订阅导致数组长度变化）
        const copyListeners = [...listeners];
        for (let i = 0; i < copyListeners.length; i++) {
            const item = copyListeners[i];
            // 执行回调（绑定上下文）
            item.callback.call(item.ctx, ...args);
            // 单次订阅：执行后从原数组中删除
            if (item.isOnce) {
                this._removeListener(eventName, item.callback, item.ctx);
            }
        }
    }

    /**
     * 取消订阅消息（支持取消单个/全部回调）
     * @param eventName 消息名（不传则取消当前上下文的所有订阅）
     * @param callback 回调函数（不传则取消该消息的所有回调）
     * @param ctx 执行上下文（必传，否则无法精准匹配）
     */
    public off(eventName?: string, callback?: EventCallback, ctx: any = null): void {
        // 边界处理：无上下文直接返回
        if (!ctx) {
            console.warn(`[GlobalEvent] 取消订阅失败：上下文不能为空`);
            return;
        }
        // 情况1：不传消息名 → 取消该上下文的所有订阅
        if (!eventName) {
            this._eventMap.forEach((listeners, name) => {
                this._removeListener(name, callback, ctx);
            });
            return;
        }
        // 情况2：传消息名 → 取消该消息下的指定/所有回调
        this._removeListener(eventName, callback, ctx);
    }

    /**
     * 清空指定消息的所有订阅（场景切换时推荐使用）
     * @param eventName 消息名（不传则清空所有消息的订阅）
     */
    public clear(eventName?: string): void {
        if (eventName) {
            this._eventMap.delete(eventName);
        } else {
            this._eventMap.clear();
        }
    }

    /**
     * 私有方法：移除指定的订阅项（内部调用，不对外暴露）
     */
    private _removeListener(eventName: string, callback?: EventCallback, ctx: any = null): void {
        const listeners = this._eventMap.get(eventName);
        if (!listeners) return;
        // 过滤保留：不符合移除条件的订阅项
        const newListeners = listeners.filter(item => {
            // 上下文不匹配 → 保留
            if (item.ctx !== ctx) return true;
            // 传了回调 → 仅移除该回调；没传回调 → 移除该上下文的所有回调
            return callback ? item.callback !== callback : false;
        });
        // 更新映射表：若过滤后为空，直接删除该消息，否则更新数组
        if (newListeners.length === 0) {
            this._eventMap.delete(eventName);
        } else {
            this._eventMap.set(eventName, newListeners);
        }
    }

    // 常驻节点无需销毁，若手动销毁则清空单例和映射表
    protected onDestroy(): void {
        GlEventMgr.Instance = null;
        this._eventMap.clear();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


