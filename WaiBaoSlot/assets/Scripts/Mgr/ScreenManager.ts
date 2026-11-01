import { _decorator, Component, view, Node, macro, sys } from 'cc';
const { ccclass } = _decorator;

interface BoolItem {
  id: string;        // 唯一标识，用于删除/查找
  label: string;     // 标签
  value: boolean;    // 布尔值
}

@ccclass('ScreenManager')
export class ScreenManager extends Component {
    // public static instance: ScreenManager = new ScreenManager();
    public static instance: ScreenManager | null = null;

    private items: BoolItem[] = [];
    private curValue = false
    private _autoIdSeed: number = 0;

    onLoad() {
        //引擎加载组件的时候赋值单例！！
        if(ScreenManager.instance === null){
            ScreenManager.instance = this;
            // view.addPersistRootNode(this.node);
        }else{
            // 如果不小心重复挂载管理器脚本，直接销毁多余节点
            this.node.destroy();
        }
    }
    onDestroy(){
        if(ScreenManager.instance === this){
            ScreenManager.instance = null;
        }
    }


    public checkMobileOS() {
        if(sys.platform === sys.Platform.ANDROID){
            // android
            return "android";
        }else if(sys.platform === sys.Platform.IOS){
            // ios
            return "ios";
        }else if(sys.platform === sys.Platform.WIN32){
            // windows
            return "windows";
        }else if(sys.platform === sys.Platform.MACOS){
            // mac
            return "mac";
        }else if(sys.platform === sys.Platform.WECHAT_GAME){
            // 微信
            return "wechat";
        }else if(sys.platform === sys.Platform.DESKTOP_BROWSER){
            // 网页
            return "browser";
        }
        return "unknown";
    }

    

    // 添加新数据
    add(label: string = "", value: boolean): BoolItem {
        const newId = (++this._autoIdSeed).toString();
        const item: BoolItem = {
        id: newId, // 或自己生成唯一 id
        label,
        value,
        };
        this.items.push(item);
        this.setCurScreenValue()
        return item;
    }

    // 根据 id 删除
    removeById(id: string): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return false;
        this.items.splice(index, 1);
        this.setCurScreenValue()
        return true;
    }

    // 根据 label 删除（可能删多个）
    removeByLabel(label: string): number {
        const before = this.items.length;
        this.items = this.items.filter(item => item.label !== label);
        this.setCurScreenValue()
        return before - this.items.length;
    }

    // 修改某个 bool 值
    toggle(id: string): void {
        const item = this.items.find(i => i.id === id);
        if (item) item.value = !item.value;
    }

    // 获取所有数据
    getAll(): BoolItem[] {
        return this.items;
    }
    setCurScreenValue(){
        this.curValue = this.getLastScreenIsPortait()
    }
    getCurScreenValue(){
        return this.curValue
    }
    checkIsLast( id:string ){
        const last = this.items[this.items.length - 1];
        return id == last.id
    }
    getLastScreenIsPortait():boolean{
        const last = this.items[this.items.length - 1];
        if (last) {
            return last.value;
        }
        return false;
    }
}
