/********* cordova-rib-screenshot.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>
#import <MessageUI/MessageUI.h>

@interface CordovaRibScreenshot : CDVPlugin <MFMailComposeViewControllerDelegate> {
    // Member variables go here.
}

//@property (weak, nonatomic) UIViewController * presenter;

- (void)screenshot:(CDVInvokedUrlCommand*)command;

@end

@implementation CordovaRibScreenshot

- (void)screenshot:(CDVInvokedUrlCommand*)command
{

    NSString* callbackId = command.callbackId;
    NSString* title = [command argumentAtIndex:0];
    NSString* message = [command argumentAtIndex:1];

    CDVPluginResult* pluginResult = nil;
    NSString* echo = [command.arguments objectAtIndex:0];

    // Make screenshot
    UIImage* screenshot = [self getScreenshot];

    MFMailComposeViewController *picker = [[MFMailComposeViewController alloc] init];
    picker.mailComposeDelegate = self;

    NSMutableString *subject = [NSMutableString string];
    [subject appendString:[title stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    [picker setSubject: subject];

    // Set up the recipients.
    NSArray *toRecipients = [NSArray arrayWithObjects:@"", nil];
    [picker setToRecipients:toRecipients];

    NSMutableString *htmlMsg = [NSMutableString string];
    [htmlMsg appendString:@"<html><body><p>"];
    [htmlMsg appendString:@"Attached is a screenshot from the RIB iTWO ControllingReport:"];
    [htmlMsg appendString:message];
    [htmlMsg appendString:@"</p></body></html>"];

    NSData *jpegData = UIImageJPEGRepresentation(screenshot, 1);
    NSString *fileName = @"ControllingReport Screenshot";
    fileName = [fileName stringByAppendingPathExtension:@"jpeg"];
    [picker addAttachmentData:jpegData mimeType:@"image/jpeg" fileName:fileName];
    [picker setMessageBody:htmlMsg isHTML:YES];


    if ([self.viewController respondsToSelector:@selector(presentViewController:animated:completion:)]){
        [self.viewController presentViewController:picker animated:YES completion:nil];
    } else {
        [self.viewController presentModalViewController:picker animated:YES];
    }

    if (echo != nil && [echo length] > 0) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:echo];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}

// The mail compose view controller delegate method
- (void)mailComposeController:(MFMailComposeViewController *)controller
          didFinishWithResult:(MFMailComposeResult)result
                        error:(NSError *)error
{
    switch (result) {
        case MFMailComposeResultCancelled:
            NSLog(@"Cancelled");
            break;
        case MFMailComposeResultSaved:
            NSLog(@"Saved");
            break;
        case MFMailComposeResultSent:
            NSLog(@"Sent");
            break;
        case MFMailComposeResultFailed:
            NSLog(@"failed");
            break;
        default:
            break;
    }
    //[self dismissModalViewControllerAnimated:YES];
    [self.viewController dismissViewControllerAnimated:YES completion:nil];
}

- (UIImage *)getScreenshot
{
    UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
    CGRect rect = [keyWindow bounds];
    UIGraphicsBeginImageContextWithOptions(rect.size, YES, 0);
    [keyWindow drawViewHierarchyInRect:keyWindow.bounds afterScreenUpdates:YES];
    UIImage *img = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return img;
}

@end
