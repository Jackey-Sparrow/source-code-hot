package cordova.rib.screenshot;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Environment;
import android.os.StatFs;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class ScreenshotTools {     
  /***    
    * @author Johnson    
    *       
    * */     
  public static long minSizeSDcard = 50;     
  public static String filePath = Environment.getExternalStorageDirectory()
      + "/FJBICache";     
  public static String fileName = "chart.png";
  public static String detailPath = filePath + File.separator + fileName;
  public static final int SEND_EMAIL = 1;     
  // public static String detailPath="/sdcard/FjbiCache/chart.png";     
  /**
    *       
    * @author Johnson    
    *       
    * */     
  public static void sendEmail(Context context, String[] to, String subject,
      String body, String path) {
    Intent email = new Intent(android.content.Intent.ACTION_SEND);
    if (to != null) {
      email.putExtra(android.content.Intent.EXTRA_EMAIL, to);
    }
    if (subject != null) {
      email.putExtra(android.content.Intent.EXTRA_SUBJECT, subject);
    }
    if (body != null) {
      email.putExtra(android.content.Intent.EXTRA_TEXT, body);
    }
    if (path != null) {


       File file = new File(path);
      email.putExtra(android.content.Intent.EXTRA_STREAM,
          Uri.fromFile(file));
      email.setType("image/png");
    }
    context.startActivity(Intent.createChooser(email, "choose"));
  }

  private static Bitmap takeScreenShot(Activity activity) {
    View view = activity.getWindow().getDecorView();
    view.setDrawingCacheEnabled(true);
    view.buildDrawingCache();
    Bitmap b1 = view.getDrawingCache();
    Rect frame = new Rect();    activity.getWindow().getDecorView().getWindowVisibleDisplayFrame(frame);
    int statusBarHeight = frame.top;
    System.out.println(statusBarHeight);
    int width = activity.getWindowManager().getDefaultDisplay().getWidth();
    int height = activity.getWindowManager().getDefaultDisplay()
        .getHeight();
    Bitmap b = Bitmap.createBitmap(b1, 0, statusBarHeight, width, height
            - statusBarHeight);
    view.destroyDrawingCache();
    return b;
  }
  /**
    *
    * @author Johnson
    * **/
  private static void savePic(Bitmap b, String filePath, String fileName) {
    File f = new File(filePath);
    if (!f.exists()) {
      f.mkdir();
    }
    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(filePath + File.separator + fileName);
      if (null != fos) {
        b.compress(Bitmap.CompressFormat.PNG, 90, fos);
        fos.flush();
        fos.close();
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
  /**
    *
    *
    * @author Johnson
    * **/
  public static void takeScreenShotToEmail(Context context, Activity a, JSONObject json) {
    if (getAvailableSDcard(context)) {
      savePic(takeScreenShot(a), filePath, fileName);
        String subject;
        String content;
        try{
            subject = java.net.URLDecoder.decode(json.getString("target"), "UTF-8");
            content = json.getString("content");
        }
        catch (Exception e){
            Log.e("Json Parse Error",e.getMessage());
            subject = "Error";
            content = "Error";
        }
      // selectDialog(context);
      sendEmail(context, null, subject, content, detailPath);
    }
  }
  /***
    *
    * @author Johnson minSizeSDcard>50kb
    * */
  public static boolean getAvailableSDcard(Context context) {
    boolean sdCardExist = Environment.getExternalStorageState().equals(
        android.os.Environment.MEDIA_MOUNTED);
    System.out.println("+++" + sdCardExist);
    if (sdCardExist) {     
      File path = Environment.getExternalStorageDirectory();
      StatFs stat = new StatFs(path.getPath());
      long blockSize = stat.getBlockSize();     
      long availableBlocks = stat.getAvailableBlocks();     
      long sdCardSize = (availableBlocks * blockSize) / 1024;// KBֵ     
      if (sdCardSize > minSizeSDcard) {     
        System.out.println("SDcardSize:::" + minSizeSDcard + "KB");
        return true;     
      } else {     
        Toast.makeText(context, "", Toast.LENGTH_SHORT).show();
      }     
    } else {     
      Toast.makeText(context, "", Toast.LENGTH_SHORT)
          .show();     
    }     
    return false;     
  }     
}       