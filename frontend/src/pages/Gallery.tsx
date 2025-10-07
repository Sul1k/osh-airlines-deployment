import { useEffect } from 'react';
import { useApp } from '../lib/context/AppContext';
import { Card, CardContent } from '../components/ui/card';

export function Gallery() {
  const { gallery, loadGallery } = useApp();

  useEffect(() => {
    console.log('🖼️ Gallery page: Loading gallery images...');
    loadGallery();
  }, []); // Empty dependency array to run only once

  // Console logging for gallery images
  useEffect(() => {
    console.log('🖼️ Gallery images loaded:', gallery.length);
    console.log('🖼️ Gallery images:', gallery.map(img => ({ 
      id: img.id, 
      title: img.title,
      category: img.category,
      active: img.active
    })));
  }, [gallery]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="mb-4">Gallery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our fleet, destinations, and the OSH Airlines experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((image, index) => (
          <Card key={image.id || `image-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-video overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p>{image.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}