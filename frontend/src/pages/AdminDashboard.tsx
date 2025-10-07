import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Image, TrendingUp, Plus, Edit, Trash2, Ban, CheckCircle, Calendar, Plane } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { useToast } from '../hooks/useToast';
import { sanitizeTextInput, isValidEmail } from '../lib/utils/sanitize';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Loading } from '../components/ui/loading';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();
  const { 
    currentUser, 
    users, 
    companies, 
    flights, 
    bookings, 
    banners, 
    gallery, 
    blockUser, 
    unblockUser, 
    addCompany, 
    updateCompany, 
    deleteCompany, 
    addUser, 
    deleteUser, 
    addBanner, 
    updateBanner, 
    deleteBanner, 
    addGalleryImage, 
    deleteGalleryImage, 
    loadUsers, 
    loadCompanies, 
    loadBookings,
    loadBanners, 
    loadGallery, 
  } = useApp();

  const [statsFilter, setStatsFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'users', 'managers', 'admins'

  // Load data when component mounts
  useEffect(() => {
    loadUsers();
    loadCompanies();
    loadBookings();
    loadBanners();
    loadGallery();
  }, []); // Empty dependency array - these functions are stable

  // Company Dialog State
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<{ id: string; name: string; code: string; managerId: string } | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyManagerEmail, setCompanyManagerEmail] = useState('');

  // Banner Dialog State
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<{ id: string; title: string; description: string; imageUrl: string; link?: string; duration: number; type: 'promotion' | 'advertisement'; active?: boolean } | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerDuration, setBannerDuration] = useState('5');
  const [bannerType, setBannerType] = useState<'promotion' | 'advertisement'>('promotion');
  const [bannerActive, setBannerActive] = useState(true);

  // Gallery Dialog State
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'aircraft' | 'destination' | 'service' | 'event'>('aircraft');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gallery Delete Confirmation Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ id: string; title: string } | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const resetCompanyForm = () => {
    setCompanyName('');
    setCompanyCode('');
    setCompanyManagerEmail('');
    setEditingCompany(null);
  };

  const handleCompanySubmit = async () => {
    setIsLoading(true);
    
    // Sanitize inputs
    const sanitizedName = sanitizeTextInput(companyName, 100);
    const sanitizedCode = sanitizeTextInput(companyCode, 10);
    const sanitizedEmail = sanitizeTextInput(companyManagerEmail, 255);
    
    // Validation for company creation
    if (!sanitizedName.trim()) {
      error('Please enter a company name');
      setIsLoading(false);
      return;
    }
    if (!sanitizedCode.trim()) {
      error('Please enter a company code');
      setIsLoading(false);
      return;
    }
    if (!editingCompany && !sanitizedEmail.trim()) {
      error('Please enter a company manager email');
      setIsLoading(false);
      return;
    }
    
    // Email validation (only for new companies)
    if (!editingCompany && !isValidEmail(sanitizedEmail)) {
      error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Check for duplicate company name or code
    const existingCompany = companies.find(c => 
      c.name.toLowerCase() === sanitizedName.toLowerCase() || 
      c.code.toLowerCase() === sanitizedCode.toLowerCase()
    );
    
    if (existingCompany && (!editingCompany || existingCompany.id !== editingCompany.id)) {
      error('A company with this name or code already exists');
      setIsLoading(false);
      return;
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email.toLowerCase() === sanitizedEmail.toLowerCase());
    if (existingUser && (!editingCompany || existingUser.id !== editingCompany.managerId)) {
      error('A user with this email already exists');
      setIsLoading(false);
      return;
    }

    if (editingCompany) {
      await updateCompany(editingCompany.id, {
        name: sanitizedName,
        code: sanitizedCode,
      });
    } else {
      try {
        // Create manager user first
        const createdUser = await addUser({
          email: sanitizedEmail,
          password: 'manager123',
          name: sanitizedName + ' Manager',
          role: 'company_manager',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, false); // Don't show success message for user creation

        await addCompany({
          name: sanitizedName,
          code: sanitizedCode,
          managerId: createdUser.id,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error creating company:', err);
        error('Failed to create company');
        setIsLoading(false);
        return;
      }
    }

    resetCompanyForm();
    setIsCompanyDialogOpen(false);
    success(editingCompany ? 'Company updated successfully' : 'Company created successfully');
    setIsLoading(false);
  };

  const handleEditCompany = (company: { id: string; name: string; code: string; managerId: string }) => {
    // Find the manager user to get their email
    const manager = users.find(u => u.id === company.managerId);
    setEditingCompany(company);
    setCompanyName(company.name);
    setCompanyCode(company.code);
    setCompanyManagerEmail(manager?.email || '');
    setIsCompanyDialogOpen(true);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete the associated manager account.')) {
      // Find the company to get the manager ID
      const company = companies.find(c => c.id === companyId);
      if (company) {
        // Delete the manager user first
        deleteUser(company.managerId);
        // Then delete the company
        deleteCompany(companyId);
        success('Company and manager account deleted successfully');
      }
    }
  };

  const resetBannerForm = () => {
    setBannerTitle('');
    setBannerDescription('');
    setBannerImageUrl('');
    setBannerLink('');
    setBannerDuration('5');
    setBannerType('promotion');
    setBannerActive(true);
    setEditingBanner(null);
  };

  const handleBannerSubmit = () => {
    // Validation for banner creation
    if (!bannerTitle.trim()) {
      error('Please enter a banner title');
      return;
    }
    if (!bannerDescription.trim()) {
      error('Please enter a banner description');
      return;
    }
    if (!bannerImageUrl.trim()) {
      error('Please enter an image URL');
      return;
    }
    if (!bannerDuration || parseInt(bannerDuration) <= 0) {
      error('Please enter a valid duration (in seconds)');
      return;
    }

    const bannerData = {
      title: bannerTitle.trim(),
      description: bannerDescription.trim(),
      imageUrl: bannerImageUrl.trim(),
      link: bannerLink.trim(),
      duration: parseInt(bannerDuration),
      type: bannerType,
      active: bannerActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingBanner) {
      updateBanner(editingBanner.id, bannerData);
    } else {
      addBanner(bannerData);
    }

    resetBannerForm();
    setIsBannerDialogOpen(false);
    success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
  };

  const handleEditBanner = (banner: { id: string; title: string; description: string; imageUrl: string; link?: string; duration: number; type: 'promotion' | 'advertisement'; active?: boolean }) => {
    if (!banner.id) {
      error('Banner ID is missing. Cannot edit banner.');
      return;
    }
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerDescription(banner.description);
    setBannerImageUrl(banner.imageUrl);
    setBannerLink(banner.link || '');
    setBannerDuration(banner.duration.toString());
    setBannerType(banner.type);
    setBannerActive(banner.active || true);
    setIsBannerDialogOpen(true);
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (!bannerId) {
      error('Banner ID is missing. Cannot delete banner.');
      return;
    }
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteBanner(bannerId);
      success('Banner deleted successfully');
    }
  };

  const handleGallerySubmit = () => {
    // Validation for gallery creation
    if (!galleryTitle.trim()) {
      error('Please enter an image title');
      return;
    }
    if (!galleryDescription.trim()) {
      error('Please enter an image description');
      return;
    }
    if (!galleryImageUrl.trim()) {
      error('Please enter an image URL');
      return;
    }

    addGalleryImage({
      title: galleryTitle.trim(),
      description: galleryDescription.trim(),
      imageUrl: galleryImageUrl.trim(),
      category: galleryCategory,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setGalleryTitle('');
    setGalleryDescription('');
    setGalleryImageUrl('');
    setGalleryCategory('aircraft');
    setIsGalleryDialogOpen(false);
    success('Gallery image added successfully');
  };

  const handleDeleteGalleryImage = (imageId: string, imageTitle: string) => {
    console.log('🗑️ Delete button clicked for image ID:', imageId);
    if (!imageId) {
      error('Image ID is missing. Cannot delete image.');
      return;
    }
    setImageToDelete({ id: imageId, title: imageTitle });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGalleryImage = async () => {
    if (!imageToDelete) return;
    
    console.log('🗑️ Confirmed deletion, calling deleteGalleryImage...');
    try {
      await deleteGalleryImage(imageToDelete.id);
      success('Gallery image deleted successfully');
    } catch (error) {
      // Error is already handled in deleteGalleryImage
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    let relevantBookings = bookings; // Count all bookings, not just confirmed ones

    const now = new Date();
    if (statsFilter !== 'all') {
      const filterDate = new Date();
      if (statsFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (statsFilter === 'week') {
        filterDate.setDate(filterDate.getDate() - 7);
      } else if (statsFilter === 'month') {
        filterDate.setMonth(filterDate.getMonth() - 1);
      }

      relevantBookings = relevantBookings.filter(b => new Date(b.bookingDate) >= filterDate);
    }

    const totalFlights = flights.length;
    const upcomingFlights = flights.filter(f => {
      const departureDate = new Date(f.departureDate);
      const hasUpcomingStatus = f.status === 'upcoming' || f.status === undefined;
      return hasUpcomingStatus && departureDate > now;
    }).length;
    const completedFlights = flights.filter(f => f.status === 'passed' || new Date(f.departureDate) < now).length;
    const totalPassengers = relevantBookings.length;
    const totalRevenue = relevantBookings.reduce((sum, b) => sum + b.price, 0);

    return { totalFlights, upcomingFlights, completedFlights, totalPassengers, totalRevenue };
  }, [flights, bookings, statsFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, companies, and platform content</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all platform users. Block users to prevent them from logging in. 
                <span className="text-amber-600 font-medium">Note: You cannot block yourself to prevent system lockout.</span>
              </CardDescription>
              <div className="mt-4">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Regular Users</SelectItem>
                    <SelectItem value="managers">Company Managers</SelectItem>
                    <SelectItem value="admins">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(user => {
                    if (userFilter === 'all') return true;
                    if (userFilter === 'users') return user.role === 'user';
                    if (userFilter === 'managers') return user.role === 'company_manager';
                    if (userFilter === 'admins') return user.role === 'admin';
                    return true;
                  }).map((user, index) => (
                    <TableRow key={user.id || `user-${index}`} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!user.isActive ? (
                          <Badge variant="destructive" title="User cannot log in">Blocked</Badge>
                        ) : (
                          <Badge className="bg-green-500" title="User can log in normally">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!user.isActive ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (!user.id) {
                                error('User ID is missing. Cannot unblock user.');
                                return;
                              }
                              unblockUser(user.id);
                              success('User unblocked successfully');
                            }}
                            title="Allow user to log in again"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (!user.id) {
                                error('User ID is missing. Cannot block user.');
                                return;
                              }
                              if (user.id === currentUser?.id) {
                                warning('You cannot block yourself! This would lock you out of the system.');
                                return;
                              }
                              blockUser(user.id);
                              success('User blocked successfully');
                            }}
                            title={user.id === currentUser?.id ? "Cannot block yourself" : "Prevent user from logging in"}
                            disabled={user.id === currentUser?.id}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Airline Companies</h3>
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCompanyForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                  <DialogDescription>
                    {editingCompany ? 'Update company information' : 'Create a new airline company'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="OSH Airlines" />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Code</Label>
                    <Input value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} placeholder="OSH" />
                  </div>

                  <div className="space-y-2">
                    <Label>Manager Email</Label>
                    <Input 
                      value={companyManagerEmail} 
                      onChange={(e) => setCompanyManagerEmail(e.target.value)} 
                      placeholder="manager@company.com"
                      disabled={!!editingCompany}
                    />
                    {!editingCompany && (
                      <p className="text-xs text-muted-foreground">A manager account will be created with password: manager123</p>
                    )}
                    {editingCompany && (
                      <p className="text-xs text-muted-foreground">Manager email cannot be changed after company creation</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetCompanyForm(); setIsCompanyDialogOpen(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCompanySubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        {editingCompany ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingCompany ? 'Update' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company, index) => (
                    <TableRow key={company.id || `company-${index}`}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.code}</TableCell>
                      <TableCell>
                        {company.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCompany(company)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => company.id ? handleDeleteCompany(company.id) : error('Company ID is missing. Cannot delete company.')}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Landing Page Banners</h3>
            <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetBannerForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
                  <DialogDescription>
                    Manage promotional content on the landing page
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Summer Sale - 30% Off" />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={bannerDescription} onChange={(e) => setBannerDescription(e.target.value)} placeholder="Book your summer vacation now..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Link (Optional)</Label>
                    <Input value={bannerLink} onChange={(e) => setBannerLink(e.target.value)} placeholder="/flights" />
                  </div>

                  <div className="space-y-2">
                    <Label>Display Duration (seconds)</Label>
                    <Input type="number" value={bannerDuration} onChange={(e) => setBannerDuration(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={bannerType} onValueChange={(v: any) => setBannerType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch checked={bannerActive} onCheckedChange={setBannerActive} />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetBannerForm(); setIsBannerDialogOpen(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleBannerSubmit}>
                    {editingBanner ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner, index) => (
              <Card key={banner.id || `banner-${index}`}>
                <CardContent className="p-4">
                  <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a default image if the URL fails
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop';
                      }}
                    />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="mb-1">{banner.title}</h4>
                      <p className="text-sm text-muted-foreground">{banner.description}</p>
                    </div>
                    <Badge variant={banner.active ? 'default' : 'secondary'}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => banner.id ? handleEditBanner(banner) : error('Banner ID is missing. Cannot edit banner.')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => banner.id ? handleDeleteBanner(banner.id) : error('Banner ID is missing. Cannot delete banner.')}
                    >
                      <Trash2 className="w-4 h-4 text-destructive mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Gallery Images</h3>
            <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Gallery Image</DialogTitle>
                  <DialogDescription>
                    Add a new image to the gallery
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image Title</Label>
                    <Input value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="Modern Airport Terminal" />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={galleryDescription} onChange={(e) => setGalleryDescription(e.target.value)} placeholder="A modern airport terminal with glass architecture" />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input value={galleryImageUrl} onChange={(e) => setGalleryImageUrl(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={galleryCategory} onValueChange={(v: any) => setGalleryCategory(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aircraft">Aircraft</SelectItem>
                        <SelectItem value="destination">Destination</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGallerySubmit}>
                    Add Image
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gallery.map((image, index) => (
              <Card key={image.id || `image-${index}`}>
                <CardContent className="p-4">
                  <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                    <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mb-3">{image.title}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => image.id ? handleDeleteGalleryImage(image.id, image.title) : error('Image ID is missing. Cannot delete image.')}
                  >
                    <Trash2 className="w-4 h-4 text-destructive mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Platform Statistics</h3>
            <Select value={statsFilter} onValueChange={setStatsFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Flights</p>
                    <p className="text-2xl">{stats.totalFlights}</p>
                  </div>
                  <Plane className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Flights</p>
                    <p className="text-2xl">{stats.upcomingFlights}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Passengers</p>
                    <p className="text-2xl">{stats.totalPassengers}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Gallery Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the image "{imageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setImageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteGalleryImage}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}