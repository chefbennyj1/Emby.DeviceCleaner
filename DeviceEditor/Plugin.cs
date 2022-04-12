using System;
using System.Collections.Generic;
using System.IO;
using DeviceEditor.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Drawing;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace DeviceEditor
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasThumbImage, IHasWebPages
    {
        public static Plugin Instance { get; set; }
        public ImageFormat ThumbImageFormat => ImageFormat.Jpg;

        private readonly Guid _id = new Guid("70CBEBE5-C9E0-4586-AD4A-F5AC84B0AA8C");
        public override Guid Id => _id;

        public override string Name => "Device List Cleaner";


        public Stream GetThumbImage()
        {
            var type = GetType();
            return type.Assembly.GetManifestResourceStream(type.Namespace + ".thumb.jpg");
        }

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer) : base(applicationPaths,
            xmlSerializer)
        {
            Instance = this;
        }

        public IEnumerable<PluginPageInfo> GetPages() => new[]
        {
            new PluginPageInfo
            {
                Name = "DeviceEditorConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DeviceEditorConfigurationPage.html"
            },
            new PluginPageInfo
            {
                Name = "DeviceEditorConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DeviceEditorConfigurationPage.js"
            }
        };
    }
}
