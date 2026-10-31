import { _decorator, Component, Node, Vec2,Button, instantiate, Prefab, NodeEventType, UITransform, Vec3,Tween } from 'cc';
import { ResMgr } from './ResMgr';
import { GlEventMgr } from './GlEventMgr';
import { SoundMgr } from "./SoundMgr";
import { ScreenManager } from './ScreenManager';

const { ccclass, property } = _decorator;


// ==================== 类型定义 ====================

/**
 * UI控制器基类
 * 所有UI控制器必须继承此类
 */
export abstract class UICtrl extends Component {
    // 修复：使用正确的类型定义
    public view: { [key: string]: Node } = {};
    
    // 修复：记录所有事件监听以便销毁时取消
    private _eventListeners: Array<{
        node: Node;
        type: string;
        callback: Function;
        target: any;
    }> = [];

    /**
     * 初始化视图 - 子类可重写
     */
    protected abstract initView(): void;

    /**
     * 加载所有子节点到view字典
     * 使用迭代方式避免深层递归栈溢出
     */
    private loadAllObject(root: Node, path: string): void {
        const queue: Array<{ node: Node; path: string }> = [{ node: root, path }];

        while (queue.length > 0) {
            const { node, path } = queue.shift()!;

            for (const child of node.children) {
                const temp_path = path + child.name;
                this.view[temp_path] = child;
                queue.push({ node: child, path: temp_path + "/" });
            }
        }
    }

    /**
     * 确保按钮节点有效
     */
    private ensureButtonNode(btnName: string): Node | null {
        const btnNode = this.view[btnName];
        if (!btnNode) {
            console.warn(`[UICtrl] 按钮节点不存在: ${btnName}`);
            return null;
        }
        const button = btnNode.getComponent(Button);
        if (!button) {
            console.warn(`[UICtrl] 节点 ${btnName} 没有 Button 组件`);
            return null;
        }
        return btnNode;
    }

    /**
     * 添加按钮点击事件
     */
    public addButtonClick(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.ensureButtonNode(btnName);
        if (!btnNode) return;

        // ✅ 包装一层：先播音效，再执行原回调
        const wrappedFunc = (...args: any[]) => {
            // 播放一个默认音效
            try {
                if (SoundMgr.Instance) SoundMgr.Instance.playSound("GameMain","Sounds/btnClick");
            } catch(e) {
                console.warn("playSound 失败:", e);
            }
            func.apply(caller, args);
        };

        btnNode.on(Button.EventType.CLICK, wrappedFunc, caller);
        
        // 记录事件监听
        this._eventListeners.push({
            node: btnNode,
            type: Button.EventType.CLICK,
            callback: func,
            target: caller
        });
    }

    /**
     * 添加触摸开始事件
     */
    public addButtonTouchStart(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.ensureButtonNode(btnName);
        if (!btnNode) return;

        btnNode.on(NodeEventType.TOUCH_START, func, caller);
        
        this._eventListeners.push({
            node: btnNode,
            type: NodeEventType.TOUCH_START,
            callback: func,
            target: caller
        });
    }

    /**
     * 添加触摸移动事件
     */
    public addButtonTouchMove(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.ensureButtonNode(btnName);
        if (!btnNode) return;

        btnNode.on(NodeEventType.TOUCH_MOVE, func, caller);
        
        this._eventListeners.push({
            node: btnNode,
            type: NodeEventType.TOUCH_MOVE,
            callback: func,
            target: caller
        });
    }

    /**
     * 添加触摸结束事件
     */
    public addButtonTouchEnd(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.ensureButtonNode(btnName);
        if (!btnNode) return;

        btnNode.on(NodeEventType.TOUCH_END, func, caller);
        
        this._eventListeners.push({
            node: btnNode,
            type: NodeEventType.TOUCH_END,
            callback: func,
            target: caller
        });
    }

    /**
     * 添加触摸取消事件
     */
    public addButtonTouchCancel(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.ensureButtonNode(btnName);
        if (!btnNode) return;

        btnNode.on(NodeEventType.TOUCH_CANCEL, func, caller);
        
        this._eventListeners.push({
            node: btnNode,
            type: NodeEventType.TOUCH_CANCEL,
            callback: func,
            target: caller
        });
    }

    /**
     * 移除按钮点击事件
     */
    public removeButtonClick(btnName: string, caller: any, func: (...args: any[]) => void): void {
        const btnNode = this.view[btnName];
        if (!btnNode) return;

        btnNode.off(Button.EventType.CLICK, func, caller);
        
        // 从记录中移除
        this._removeEventListenerRecord(btnNode, Button.EventType.CLICK, func, caller);
    }

    /**
     * 移除所有该节点的指定类型事件
     */
    public removeAllEventsOnNode(btnName: string, eventType: string): void {
        const btnNode = this.view[btnName];
        if (!btnNode) return;

        // 找到并取消所有该节点该类型的事件
        const toRemove = this._eventListeners.filter(
            listener => listener.node === btnNode && listener.type === eventType
        );
        
        for (const listener of toRemove) {
            listener.node.off(listener.type as any, listener.callback, listener.target);
        }
        
        // 从记录中移除
        this._eventListeners = this._eventListeners.filter(
            listener => !(listener.node === btnNode && listener.type === eventType)
        );
    }

    /**
     * 从事件记录中移除指定项
     */
    private _removeEventListenerRecord(node: Node, type: string, callback: Function, target: any): void {
        const index = this._eventListeners.findIndex(
            listener =>
                listener.node === node &&
                listener.type === type &&
                listener.callback === callback &&
                listener.target === target
        );
        
        if (index !== -1) {
            this._eventListeners.splice(index, 1);
        }
    }

    /**
     * 获取节点
     */
    public getNode(path: string): Node | null {
        return this.view[path] || null;
    }

    onLoad() {
        this.view = {};
        this._eventListeners = [];
        this.loadAllObject(this.node, "");
        this.initView();
    }

    /**
     * 手动清理所有事件监听（不移除节点）
     */
    public clearAllEvents(): void {
        // 清理全局事件
        GlEventMgr.Instance.off(undefined, undefined, this);

        // 清理节点事件
        for (const listener of this._eventListeners) {
            try {
                if (listener.node && listener.node.isValid) {
                    listener.node.off(listener.type as any, listener.callback, listener.target);
                }
            } catch (e) {
                console.warn(`[UICtrl] 取消事件监听失败:`, e);
            }
        }
        this._eventListeners = [];
    }

    // 递归停止节点及其所有子节点的 tween
    protected stopAllTweensRecursive(node: Node) {
        if (!node || !node.isValid || !node.children) {
            return;
        }
        Tween.stopAllByTarget(node);
        for (const child of node.children) {
            this.stopAllTweensRecursive(child);
        }
    }

    onDisable() {
        // 节点被 removeFromParent / active=false 时，停止该节点所有 tween
        this.stopAllTweensRecursive(this.node);
        this.clearAllEvents();
    }

    /**
     * 销毁时清理所有事件监听
     */
    protected onDestroy() {
        // 节点销毁时再保险清一次
        this.stopAllTweensRecursive(this.node);
        this.clearAllEvents();
    }

    /**
     * 安全延时方法
     */
    public delay(seconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }

    /**
     * 等待 Cocos 下一帧渲染完成
     */
    public waitNextFrame(): Promise<void> {
        return new Promise<void>(resolve => {
            this.scheduleOnce(() => resolve(), 0);
        });
    }

    update(deltaTime: number) {}

    /**
     * 
     * @returns 界面是否竖屏
     * 界面可能需要重写方法
     */
    public isPortrait(){
        return false;
    }
}


// ==================== UI管理器 ====================

/**
 * UI层级枚举
 */
export enum UILayer {
    Background = 0,  // 背景层
    Normal = 1,      // 普通层
    Popup = 2,       // 弹窗层
    Top = 3,         // 顶层（如Toast、Loading）
    System = 4       // 系统层（最高）
}

/**
 * UI信息接口
 */
interface UIInfo {
    node: Node | null;
    ctrl: UICtrl | null;
    layer: UILayer;
    prefabPath: string;
}

/**
 * UI管理器单例类
 */
@ccclass('UIMgr')
export class UIMgr extends Component {
    public static Instance: UIMgr | null = null;

    // 修复：使用正确的类型定义
    private _canvas: Node | null = null;
    private _uiLayers: Map<UILayer, Node> = new Map();
    private _uiMap: Map<string, UIInfo> = new Map();
    private _uiPools: Map<string, Node[]> = new Map();

    // UI层级节点名称前缀
    private readonly LAYER_NODE_PREFIX: string = "UILayer_";

    protected onLoad(): void {
        if (UIMgr.Instance === null) {
            UIMgr.Instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this._canvas = this.node;
        this._initUILayers();
    }

    /**
     * 初始化UI层级节点
     */
    private _initUILayers(): void {
        // 确保Canvas存在
        if (!this._canvas) {
            console.error("[UIMgr] Canvas节点不存在!");
            return;
        }

        // 使用 Object.keys 获取所有枚举键
        const layerKeys = Object.keys(UILayer);
        
        for (const key of layerKeys) {
            // 将字符串键转换为 UILayer 枚举值
            const layerValue = UILayer[key as keyof typeof UILayer];
            
            // 只处理数字值（排除 reverse mapping 的字符串值）
            if (typeof layerValue === 'number') {
                const layerName = UILayer[layerValue];
                const layerNode = new Node(`${this.LAYER_NODE_PREFIX}${layerName}`);
                layerNode.parent = this._canvas;
                layerNode.setPosition(new Vec3(0,0,0));
                
                // 设置层级优先级
                //const transform = layerNode.getComponent(UITransform);

                // 2. 挂载 UITransform 组件（UI 节点必须有该组件）
                const uiTransform = layerNode.addComponent(UITransform);
                // 3. 配置 UITransform 组件的属性（可选）
                if (ScreenManager.instance.getCurScreenValue() == true){
                    uiTransform.setContentSize(768, 1370); // 设置节点宽 200，高 100
                }else{
                    uiTransform.setContentSize(1370, 768);
                }
                uiTransform.anchorPoint = new Vec2(0.5, 0.5); // 锚点居中

                if (uiTransform) {
                    // uiTransform.priority = layerValue;
                }
                
                this._uiLayers.set(layerValue, layerNode);
                
                console.log(`[UIMgr] 创建UI层级: ${layerName} (priority: ${layerValue})`);
            }
        }

        console.log("[UIMgr] UI层级初始化完成，共创建 " + this._uiLayers.size + " 个层级");
    }

    /**
     * 获取或创建层级节点
     */
    private _getLayerNode(layer: UILayer): Node {
        let layerNode = this._uiLayers.get(layer);
        
        if (!layerNode) {
            layerNode = new Node(`${this.LAYER_NODE_PREFIX}${UILayer[layer]}`);
            layerNode.parent = this._canvas;
            // layerNode.setPosition(new Vec3(-384,-685,0));
            
            // const transform = layerNode.getComponent(UITransform);

            // 2. 挂载 UITransform 组件（UI 节点必须有该组件）
            const uiTransform = layerNode.addComponent(UITransform);
            // 3. 配置 UITransform 组件的属性（可选）
            if (ScreenManager.instance.getCurScreenValue() == true){
                uiTransform.setContentSize(768, 1370); // 设置节点宽 200，高 100
            }else{
                uiTransform.setContentSize(1370, 768);
            }
            uiTransform.anchorPoint = new Vec2(0.5, 0.5); // 锚点居中

            // if (uiTransform) {
            //     uiTransform.priority = layer;
            // }
            
            this._uiLayers.set(layer, layerNode);
        }
        
        return layerNode;
    }

    /**
     * 显示UI（带对象池支持）
     * @param abName AB包名
     * @param resPath 资源路径
     * @param uiCtrlClass UI控制器类
     * @param layer UI层级
     * @param parent 自定义父节点（可选）
     * @returns UI控制器实例或null
     */
    public showUi<T extends UICtrl>(
        abName: string,
        resPath: string,
        uiName:string,
        layer: UILayer = UILayer.Normal,
        parent?: Node
    ): T | null {

        // 先从对象池获取
        let uiNode = this._getFromPool(uiName);

        if (!uiNode) {
            // 对象池没有，从资源加载
            const prefab = ResMgr.Instance?.getAsset(abName, resPath, Prefab);

            if (!prefab) {
                console.error(`[UIMgr] 加载UI预制体失败: ${abName}/${resPath}`);
                return null;
            }

            uiNode = instantiate(prefab);
        }

        const targetParent = parent || this._getLayerNode(layer);
        targetParent.addChild(uiNode);

        // 添加控制器组件
        const ctrl = uiNode.addComponent(uiName) as T;

        // 记录UI信息
        this._uiMap.set(uiName, {
            node: uiNode,
            ctrl: ctrl,
            layer: layer,
            prefabPath: `${abName}/${resPath}`
        });

        console.log(`[UIMgr] 显示UI: ${uiName}, 层级: ${UILayer[layer]}`);

        return ctrl;
    }

    /**
     * 从对象池获取UI节点
     */
    private _getFromPool(uiName: string): Node | null {
        const pool = this._uiPools.get(uiName);
        
        if (pool && pool.length > 0) {
            const node = pool.pop()!;
            node.active = true;
            console.log(`[UIMgr] 从对象池获取UI: ${uiName}`);
            return node;
        }
        
        return null;
    }

    /**
     * 回收UI到对象池
     * @param uiCtrl UI控制器实例
     */
    public recycleUi(uiName: string): boolean {
        const uiInfo = this._uiMap.get(uiName);
        let uiCtrl = uiInfo.ctrl;
        if (!uiInfo) {
            console.warn(`[UIMgr] 回收UI失败: ${uiName} 未在管理列表中`);
            return false;
        }

        // ==============================================
        // 回收前先清理事件
        // ==============================================
        uiCtrl.clearAllEvents();
        
        // 从父节点移除
        uiCtrl.node.removeFromParent();
        uiCtrl.node.active = false;
        
        // 添加到对象池
        if (!this._uiPools.has(uiName)) {
            this._uiPools.set(uiName, []);
        }
        this._uiPools.get(uiName)!.push(uiCtrl.node);
        
        // 从管理列表移除
        this._uiMap.delete(uiName);
        
        console.log(`[UIMgr] 回收UI到对象池: ${uiName}`);
        
        return true;
    }

    /**
     * 关闭并销毁UI
     * @param uiName UI名称
     */
    public closeUi(uiName: string): boolean {
        const uiInfo = this._uiMap.get(uiName);
        
        if (!uiInfo) {
            console.warn(`[UIMgr] 关闭UI失败: ${uiName} 未找到`);
            return false;
        }

        // ==============================================
        // 关键：先清理事件，再销毁节点
        // ==============================================
        if (uiInfo.ctrl) {
            uiInfo.ctrl.clearAllEvents();
        }
        
        // 销毁节点（会自动调用UICtrl的onDestroy）
        if (uiInfo.node) {
            uiInfo.node.destroy();
        }
        
        // 从管理列表移除
        this._uiMap.delete(uiName);
        
        // 从对象池也清除
        this._uiPools.delete(uiName);
        
        console.log(`[UIMgr] 关闭并销毁UI: ${uiName}`);
        
        return true;
    }

    /**
     * 关闭所有UI
     * @param includeLayer 是否包含指定层级（可选）
     */
    public closeAllUi(includeLayer?: UILayer): void {
        const toClose: string[] = [];
        
        this._uiMap.forEach((info, name) => {
            if (!includeLayer || info.layer === includeLayer) {
                toClose.push(name);
            }
        });
        
        for (const name of toClose) {
            this.closeUi(name);
        }
        
        console.log(`[UIMgr] 关闭所有UI, 共 ${toClose.length} 个`);
    }

    /**
     * 获取已显示的UI控制器
     * @param uiCtrlClass UI控制器类
     */
    public getUi<T extends UICtrl>(uiCtrlClass: new () => T): T | null {
        const uiName = uiCtrlClass.name.replace("_Ctrl", "");
        const uiInfo = this._uiMap.get(uiName);
        
        if (uiInfo && uiInfo.ctrl) {
            return uiInfo.ctrl as T;
        }
        
        return null;
    }

    /**
     * 检查UI是否已显示
     */
    public isUiVisible(uiCtrlClass: new () => UICtrl): boolean {
        const uiName = uiCtrlClass.name.replace("_Ctrl", "");
        return this._uiMap.has(uiName);
    }

    /**
     * 获取UI信息
     */
    public getUiInfo(uiName: string): UIInfo | null {
        return this._uiMap.get(uiName) || null;
    }

    /**
     * 预加载UI到对象池
     * @param abName AB包名
     * @param resPath 资源路径
     * @param uiCtrlClass UI控制器类
     * @param count 预加载数量
     */
    public preloadUi(
        abName: string,
        resPath: string,
        uiCtrlClass: new () => UICtrl,
        count: number = 1
    ): void {
        const uiName = uiCtrlClass.name.replace("_Ctrl", "");
        
        for (let i = 0; i < count; i++) {
            const prefab = ResMgr.Instance?.getAsset(abName, resPath, Prefab);
            
            if (prefab) {
                const node = instantiate(prefab);
                node.active = false;
                
                if (!this._uiPools.has(uiName)) {
                    this._uiPools.set(uiName, []);
                }
                this._uiPools.get(uiName)!.push(node);
            }
        }
        
        console.log(`[UIMgr] 预加载UI: ${uiName}, 数量: ${count}`);
    }

    /**
     * 清空对象池
     */
    public clearPool(uiName?: string): void {
        if (uiName) {
            const pool = this._uiPools.get(uiName);
            if (pool) {
                for (const node of pool) {
                    node.destroy();
                }
                this._uiPools.delete(uiName);
                console.log(`[UIMgr] 清空对象池: ${uiName}`);
            }
        } else {
            // 清空所有
            this._uiPools.forEach((pool, name) => {
                for (const node of pool) {
                    node.destroy();
                }
            });
            this._uiPools.clear();
            console.log("[UIMgr] 清空所有对象池");
        }
    }

    

    /**
     * 销毁时清理
     */
    protected onDestroy(): void {
        // 关闭所有UI
        this.closeAllUi();
        
        // 清空对象池
        this.clearPool();
        
        // 清理层级节点
        if (this._canvas) {
            for (const layerNode of this._uiLayers.values()) {
                if (layerNode && layerNode.isValid) {
                    layerNode.destroy();
                }
            }
            this._uiLayers.clear();
        }
        
        UIMgr.Instance = null;
        console.log("[UIMgr] 已销毁，所有资源已清理");
    }

    update(deltaTime: number) {}
}

