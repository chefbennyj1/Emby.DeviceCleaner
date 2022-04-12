
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading;
//using System.Threading.Tasks;
//using MediaBrowser.Common.Net;
//using MediaBrowser.Controller;
//using MediaBrowser.Controller.Devices;
//using MediaBrowser.Controller.Net;
//using MediaBrowser.Controller.Session;
//using MediaBrowser.Model.Devices;
//using MediaBrowser.Model.Logging;
//using MediaBrowser.Model.Services;
//using MediaBrowser.Model.Tasks;

//namespace DeviceEditor
//{
//    public class DeviceCleanerScheduledTask : IScheduledTask, IConfigurableScheduledTask
//    {
//        public bool IsHidden => false;

//        public bool IsEnabled => Plugin.Instance.Configuration.scheduledTaskEnabled;

//        public bool IsLogged => true;

//        private ILogManager LogManager { get; set; }
//        private IDeviceManager DeviceManager { get; set; }
//        private ISessionManager SessionManager { get; set; }
//        private IHttpClient Client { get; set; }
//        private ILogger logger { get; set; }
//        private IServerApplicationHost Host { get; set; }
//        public DeviceCleanerScheduledTask(IDeviceManager dM, ISessionManager sM, IHttpClient client, ILogManager logManager, IServerApplicationHost host)
//        {
//            DeviceManager = dM;
//            SessionManager = sM;
//            Client = client;
//            LogManager = logManager;
//            Host = host;
            
//        }
//        public async Task Execute(CancellationToken cancellationToken, IProgress<double> progress)
//        {
//            logger = LogManager.GetLogger(Plugin.Instance.Name);
//            var devices = DeviceManager.GetDevices(new DeviceQuery());
//            var groupList = devices.Items.GroupBy(d => d.Name);
            
//            foreach (var group in groupList)
//            {
                
//                if (group.Count() < Plugin.Instance.Configuration.threshold) continue;
//                foreach (var session in SessionManager.Sessions)
//                {
//                    foreach (var device in group)
//                    {
                        
//                        logger.Info("DEVICE CLEANER - " + device.AppName + " has " + group.Count() + " instances");
//                        if (session.DeviceId == device.Id) continue;
                        
//                        await Client.SendAsync(new HttpRequestOptions()
//                        {
//                            Url = Host.GetLocalApiUrl(CancellationToken.None).Result + "/emby/Devices?Id=" + device.Id
                            
//                        }, "DELETE");
//                    }
//                }
//            }
//        }


//        public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
//        {
//            return new[]
//            {
//                // Every so often
//                new TaskTriggerInfo
//                {
//                    Type = TaskTriggerInfo.TriggerInterval,
//                    IntervalTicks = TimeSpan.FromHours(24).Ticks
//                }
//            };
//        }

//        public string Name => "Device Cleaner";
//        public string Key => "DeviceCleaner";
//        public string Description => "Run Device Cleaner Plugin";
//        public string Category => "Application";
//    }
//}
