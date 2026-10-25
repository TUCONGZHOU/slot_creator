import { _decorator, Component, Node,Button } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';

@ccclass('LevelJT_PayTable_Ctrl')
export class LevelJT_PayTable_Ctrl extends UICtrl {

    private m_index:number = 1;
    private m_maxIndex:number = 6;

    start() {
        this.loadDataUI( this.m_index );
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        // 添加按钮监听
        this.addButtonClick("btn_back", this, this.closeUI);
        this.addButtonClick("btn_last", this, this.clickLast);
        this.addButtonClick("btn_next", this, this.clickNext);
    }

    public clickLast(button: Button):void{
        this.m_index -= 1;
        if (this.m_index <= 0 ){
            this.m_index = this.m_maxIndex;
        }
        this.loadDataUI( this.m_index );
    }

    private loadDataUI( index:number ):void{
        for( let i = 1; i <= this.m_maxIndex; i++ ){
            this.view["paytable"+i].active = false;
        }
        this.view["paytable"+index].active = true;
    }

    public clickNext(button: Button):void{
        this.m_index += 1;
        if (this.m_index > this.m_maxIndex ){
            this.m_index = 1;
        }
        this.loadDataUI( this.m_index );
    }

    public closeUI(button: Button): void {
        // 关闭界面
        UIMgr.Instance.closeUi("LevelCK_PayTable_Ctrl");
    }
}


