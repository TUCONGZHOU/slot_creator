import { _decorator, Component, Node,Button, Vec3, Label, tween, Prefab, instantiate, assert, Skeleton, sp } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';

@ccclass('LevelJT_BonusNode_Ctrl')
export class LevelJT_BonusNode_Ctrl extends UICtrl {
    private m_chooseMark:boolean = false;
    private m_winMul = 0;

    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {;

    }
    public initUI( id:number ):void{

    }
    public resetUI( bonusInfo ):void{
        this.view['skeleton'].active = false
        let spine:sp.Skeleton = null;
        if (bonusInfo.type == "Grand"){
            this.view['skeleton_grand'].active = true
            spine = this.view['skeleton_grand'].getComponent(sp.Skeleton) as sp.Skeleton;
            spine.setAnimation(0, "Game4-GRAND", true);
        }else if(bonusInfo.type == "Major"){
            this.view['skeleton_major'].active = true
            spine = this.view['skeleton_major'].getComponent(sp.Skeleton) as sp.Skeleton;
            spine.setAnimation(0, "Game4-MAJOR", true);
        }else if(bonusInfo.type == "Major"){
            this.view['skeleton_minor'].active = true
            spine = this.view['skeleton_minor'].getComponent(sp.Skeleton) as sp.Skeleton;
            spine.setAnimation(0, "Game4-MINOR", true);
        }else if(bonusInfo.type == "Mini"){
            this.view['skeleton_mini'].active = true
            spine = this.view['skeleton_mini'].getComponent(sp.Skeleton) as sp.Skeleton;
            spine.setAnimation(0, "Game4-MINI", true);
        }else{
            this.view['skeleton'].active = true
        }
        
    }
    
}


