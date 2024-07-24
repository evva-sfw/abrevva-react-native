#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AbrevvaNfc, NSObject)
RCT_EXTERN_METHOD(connect)
RCT_EXTERN_METHOD(disconnect)
RCT_EXTERN_METHOD(read)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}
@end