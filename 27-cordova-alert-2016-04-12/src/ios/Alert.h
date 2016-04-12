#import <Cordova/CDV.h>

@interface Alert : CDVPlugin <UIAlertViewDelegate> {}
- (void)alert:(CDVInvokedUrlCommand*)command;
@end

@interface MyAlertView : UIAlertView {}
@property (nonatomic, copy) NSString* callbackId;
@end