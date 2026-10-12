import { _decorator, Component, Node, sp,instantiate,Prefab, Vec3, UIOpacity, tween, utils } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelTR_Jackpot_Ctrl } from './LevelTR_Jackpot_Ctrl';
import { ResMgr } from '../../Mgr/ResMgr';
import { ActionType, LevelConfig } from '../../InterFace/LevelConfig';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { EventName } from '../../Mgr/EventName';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { LevelTR_BonusOverView_Ctrl } from './LevelTR_BonusOverView_Ctrl';

export interface BonusWinNodeState {
    Name: string;
    Node: Node;
};

@ccclass('LevelTR_BonusStartView_Ctrl')
export class LevelTR_BonusStartView_Ctrl extends UICtrl {

    public m_levelConfig:LevelConfig = null;
    public m_index:number = -1;

    public m_winNode:BonusWinNodeState[] = [];

    private m_spinName1:Record<string,string> = {
        Grand:"TREE of WEALTH_xyx_childgrand",
        Major:"TREE of WEALTH_xyx_childmajor",
        Minor:"TREE of WEALTH_xyx_childminor",
        Mini:"TREE of WEALTH_xyx_childmini",
        A:"TREE of WEALTH_xyx_money2",
    };

    private m_spinName2:Record<string,string> = {
        Grand:"TREE of WEALTH_xyx_childgrand2",
        Major:"TREE of WEALTH_xyx_childmajor2",
        Minor:"TREE of WEALTH_xyx_childminor2",
        Mini:"TREE of WEALTH_xyx_childmini2",
        A:"TREE of WEALTH_xyx_money3",
    };

    protected initView(): void {
        // 添加监听
        GlEventMgr.Instance.on(EventName.View_LevelSpin_bonus, this.responseBonusSpin, this);

        for( let i = 1; i <= 15; i++ ){
            this.addButtonClick("Bonus1/xyx" + i, this, ()=> this.clickSpin(i));
        }
    }

    start() 
    {
        // 先隐藏所有的xyx
        for( let i = 1; i <= 15; i++ ){
            this.view["Bonus1/xyx" + i].active = false;
        }

        // 播放背景出现动画
        let spineNode = this.view["Bonus1/xyx_di"]
        let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
        if (spine) {
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 清除监听器
                for( let i = 1; i <= 15; i++ ){
                    this.view["Bonus1/xyx" + i].active = true;
                }

                // 隐藏背景spine
                this.view["Bonus1/315_SGBG"].active = true;
                this.view["Bonus1/xyx_di"].active = false;
            });
            spine.setAnimation(0, "xyx_jzbaokai", false);
        }

        this.view["SpriteSplash2"].active = false;
        this.view["Bonus1/315_SGBG"].active = false;
        // this.view["SpriteSplash1"].active = false;
    }

    // 收到回复消息
    public responseBonusSpin():void
    {
        let spineNode = this.view[ "Bonus1/xyx" + this.m_index ]
        let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
        if (spine) {
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 清除监听器
                spineNode.active = false; // 隐藏当前的spine节点
            });
            spine.setAnimation(0, "guashi_open", false);

            Utils.performWithDelay(this.node,()=>{  
                let pos:Vec3 = spineNode.position;
                // 添加spine
                this.addBonusSpine(pos);
            },0.4); 

            // bonus出现音效
            let soundFile = this.m_levelConfig.SoundsFile["Bonus"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
            }
        }
    }

    public initUI(levelConfig:LevelConfig): void{
        this.m_levelConfig = levelConfig;
        // 创建
        this.createOtherUI();
    }

    public createOtherUI():void{
        let prefab = ResMgr.Instance.getAsset("LevelTR","Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelTR_Jackpot_Ctrl = jackpot.addComponent( LevelTR_Jackpot_Ctrl ) as LevelTR_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }

    update(deltaTime: number) {
        
    }

    public clickSpin(i: number)
    {
        if (this.m_index == -1) {
            this.m_index = i;
            // -- 请求数据
            LevelMgr.Instance.requestSpin();
        }
    }

    public addBonusSpine( pos:Vec3 ):void
    {
        let bonusInfo = LevelMgr.Instance.getLevelModel().getBonus();
        let content = bonusInfo.content;
        // 取最后一个元素
        const lastItem = content[content.length - 1];
        let actionName1 = this.m_spinName1[lastItem];
        let actionName2 = this.m_spinName2[lastItem];

        // 添加一个spine
        let spBonusPrefab = ResMgr.Instance.getAsset("LevelTR","Prefabs/BounsNode",Prefab);
        if(spBonusPrefab){
            let bonusNode = instantiate(spBonusPrefab);
            this.view["Bonus1"].addChild(bonusNode);

            // 存入节点
            if (lastItem == "A"){
                //不存入
            }else {
                let meta:BonusWinNodeState = {
                    Name: lastItem,
                    Node: bonusNode
                };
                this.m_winNode.push(meta);
            }

            bonusNode.position = pos; // 设置位置
            bonusNode.scale = new Vec3(0.5,0.5,1); // 设置初始缩放
            // -- 播放spine动画
            let spIcon1 = bonusNode.getChildByName("spIcon1")
            spIcon1.active = false; // 隐藏spIcon1
            let spIcon2 = bonusNode.getChildByName("spIcon2")
            if (spIcon2) {
                let bonusSpine = spIcon2.getComponent(sp.Skeleton) as sp.Skeleton;
                if (bonusSpine) {
                    bonusSpine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                        bonusSpine.setCompleteListener(null); // 清除监听器
                        if (lastItem == "A"){
                            // nothing to do here !!
                        }else{
                            bonusSpine.setAnimation(0, actionName2, true);
                        }
                        // 判断是否结束
                        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
                        if (nextAction == ActionType.NORMAL){
                            // 结束了
                            this.bonusOver();
                        }else 
                        {
                            // 重置
                            this.m_index = -1;
                        }
                    });
                    if (lastItem == "A"){
                        bonusSpine.setAnimation(0, actionName1, true);
                    }else{
                        bonusSpine.setAnimation(0, actionName1, false);
                    }
                }
            }
        }
    }

    public bonusOver():void{
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["BonusWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
        }

        // 从 this.m_winNode 找出 Grand Major Minor Mini 的节点 显示飞出动画    
        let grandNode:Node[] = [];
        let majorNode:Node[] = [];
        let minorNode:Node[] = [];
        let miniNode:Node[] = [];
        for( const meta of this.m_winNode ){
            if (meta.Name == "Grand"){
                grandNode.push(meta.Node);
            }else if (meta.Name == "Major"){
                majorNode.push(meta.Node);
            }else if (meta.Name == "Minor"){
                minorNode.push(meta.Node);
            }else if (meta.Name == "Mini"){
                miniNode.push(meta.Node);
            }
        }

        let targetName: string = "";           // 对应的名称（Grand/Major等）
        let guangName: string = "";             // 对应的光效名称
        let targetArray: Node[] | null = null; // 最终找到的数组
        // 依次判断哪个数组长度等于3
        if (grandNode.length === 3) {
            targetArray = grandNode;
            targetName = "Grand";
            guangName = "TREE of WEALTH_xyx_back_grand";
        } else if (majorNode.length === 3) {
            targetArray = majorNode;
            targetName = "Major";
            guangName = "TREE of WEALTH_xyx_back_major";
        } else if (minorNode.length === 3) {
            targetArray = minorNode;
            targetName = "Minor";
            guangName = "TREE of WEALTH_xyx_back_minor";
        } else if (miniNode.length === 3) {
            targetArray = miniNode;
            targetName = "Mini";
            guangName = "TREE of WEALTH_xyx_back_mini";
        }

        this.view["SpriteSplash1"].active = false;
        this.view["SpriteSplash2"].active = true;
        
        const uiOpacity = this.view["SpriteSplash2"].getComponent(UIOpacity)
        uiOpacity.opacity = 0;
        tween(uiOpacity)
        .to(1, { opacity: 255 })
        .start();

        if (targetArray) {
            for (const bonusNode of targetArray) 
            {
                let worldPos = new Vec3();
                bonusNode.getWorldPosition( worldPos );
                let localPos = new Vec3();
                this.view["SpriteSplash2"].inverseTransformPoint(localPos,worldPos);
                bonusNode.parent = this.view["SpriteSplash2"]; // 将bonusNode设置为SpriteSplash2的子节点
                bonusNode.position = localPos;
                
                let spIcon1 = bonusNode.getChildByName("spIcon1")
                spIcon1.active = true; // 显示spIcon1
                let spIcon1Spine = spIcon1.getComponent(sp.Skeleton) as sp.Skeleton;
                spIcon1Spine.setAnimation(0, guangName, true);
            }
        }

        Utils.performWithDelay(this.node,()=>{  
            this.view["SpriteSplash2"].active = false;
            // 显示bonusover界面
            let bonusOverSpinCtrl = UIMgr.Instance.showUi(this.m_levelConfig.BundleName,"Prefabs/BonusOverView","LevelTR_BonusOverView_Ctrl",UILayer.Normal) as LevelTR_BonusOverView_Ctrl;
            bonusOverSpinCtrl.initUI( this.m_levelConfig,targetName );
        },4); 
    }

    
}


