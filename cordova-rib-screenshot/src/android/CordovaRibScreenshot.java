package cordova.rib.screenshot;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class CordovaRibScreenshot extends CordovaPlugin {

    public static final String ACTION = "screenshot";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals(ACTION)) {
            try {
                String target = args.getString(0);
                String content = args.getString(1);
                JSONObject jsonObj = new JSONObject();
                jsonObj.put("target", target);
                jsonObj.put("content", content);

                ScreenshotTools.takeScreenShotToEmail(MainActivity.mContext, MainActivity.showActivity, jsonObj);

                PluginResult mPlugin = new PluginResult(PluginResult.Status.NO_RESULT);
                mPlugin.setKeepCallback(true);

                callbackContext.sendPluginResult(mPlugin);
                callbackContext.success(jsonObj);

            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }

        return true;
    }
}