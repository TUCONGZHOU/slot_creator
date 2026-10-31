import { _decorator, Component, view, macro, ResolutionPolicy, Canvas, sys, native } from 'cc';
import { ScreenManager } from '../Mgr/ScreenManager';
import { UICtrl, UILayer } from '../Mgr/UIMgr';
const { ccclass, property } = _decorator;


@ccclass('SceneOrientation')
export class SceneOrientation extends Component {
    // true=竖版场景 false=横版场景
    @property({ tooltip: "勾选为竖屏场景" })
    isPortrait: boolean = false;
    @property({tooltip:"界面名"})
    layer_name:string = ""

    private screenData = null

    onLoad() {
        this.resetIsPortrait();
        // 延迟一帧再切分辨率，避免场景刚加载时切分辨率导致 native GL 崩溃
        this.scheduleOnce(() => {
            this.resetScreen(this.isPortrait);
        }, 0.1);
        this.screenData = ScreenManager.instance.add(this.layer_name,this.isPortrait)
    }
    resetIsPortrait(){
        if (this.node.getComponent(UICtrl)){
            this.isPortrait = this.node.getComponent(UICtrl).isPortrait();
        }
    }
    
    resetScreen(isPortrait:boolean){
        if (isPortrait) {
            view.setDesignResolutionSize(768, 1375, ResolutionPolicy.FIXED_WIDTH);
            view.setOrientation(macro.ORIENTATION_PORTRAIT);
        } else {
            view.setDesignResolutionSize(1375, 768, ResolutionPolicy.FIXED_HEIGHT);
            view.setOrientation(macro.ORIENTATION_LANDSCAPE);
        }

        if(sys.platform === sys.Platform.ANDROID){
            if (isPortrait) {
                native.reflection.callStaticMethod(
                    "com/cocos/game/AppActivity",
                    "clickSetPortrait",
                    "()V"
                );
            } else {
                native.reflection.callStaticMethod(
                    "com/cocos/game/AppActivity",
                    "clickSetLandscape",
                    "()V"
                );
            }
        }else if(sys.platform === sys.Platform.IOS){
            // ios
            
        }else if(sys.platform === sys.Platform.WIN32){
            // windows

        }else if(sys.platform === sys.Platform.MACOS){
            // mac
            
        }else if(sys.platform === sys.Platform.WECHAT_GAME){
            // 微信
            
        }else if(sys.platform === sys.Platform.DESKTOP_BROWSER ){
            // // 网页
            // if (isPortrait) {
            //     // 竖屏配置 720*1280
            //     view.setDesignResolutionSize(768, 1375, ResolutionPolicy.FIXED_HEIGHT);
            //     view.setOrientation(macro.ORIENTATION_PORTRAIT);
            // } else {
            //     // 横屏配置 1280*720
            //     view.setDesignResolutionSize(1375, 768, ResolutionPolicy.FIXED_WIDTH);
            //     view.setOrientation(macro.ORIENTATION_LANDSCAPE);
            // }
        }


        // // Android 再尝试真·旋转屏幕
        // if (sys.platform === sys.Platform.ANDROID) {
        //     try {
        //         native.reflection.callStaticMethod(
        //             "com/cocos/game/AppActivity",
        //             isPortrait ? "clickSetPortrait" : "clickSetLandscape",
        //             "()V"
        //         );
        //     } catch(e) {
        //         console.warn("[SceneOrientation] 原生方法调用失败，仅切分辨率:", e);
        //     }
        // }
    }
    onDestroy(){
        this.removeScreenOrientation();
    }
    checkIsLast(){
        return ScreenManager.instance.checkIsLast( this.screenData.id )
    }
    testrot(){
        this.resetScreen(!this.isPortrait)
    }
    removeScreenOrientation(){
        ScreenManager.instance.removeById( this.screenData.id );
        // 不在 onDestroy 里切分辨率，由新场景的 onLoad 负责切
    }
}
