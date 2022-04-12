using System.Collections.Generic;
using System.Linq;
using System.Threading;
using MediaBrowser.Controller.Authentication;
using MediaBrowser.Controller.Devices;
using MediaBrowser.Controller.Net;
using MediaBrowser.Controller.Security;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.Devices;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;
using MediaBrowser.Model.Session;
using MediaBrowser.Model.Ssdp;

namespace DeviceEditor.Api
{
    public class DeviceEditorService : IService
    {
        [Route("/DuplicateDevices", "GET", Summary = "Duplicate Device List Endpoint")]
        public class DuplicateDevices : IReturn<string>
        {
            public string Duplicate { get; set; }
        }

        private static IJsonSerializer JsonSerializer { get; set; }
        private static IDeviceManager DeviceManager { get; set; }
        public DeviceEditorService(IJsonSerializer json, IDeviceManager dM, ISessionManager ses)
        {
            JsonSerializer = json;
            DeviceManager = dM;
            

        }
    }
}
