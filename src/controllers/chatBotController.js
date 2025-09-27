import { catchAsync } from "../middlewares/catchAsync.js";
import ChatBot from "../models/chatBotModal.js";
import Listing from "../models/listingModel.js";

/**
 * Save user or bot messages into the chat session
 */
export const saveMessage = catchAsync(async (req, res) => {
  const { sessionId, sender, text } = req.body;

  if (!sessionId || !sender || !text) {
    return res
      .status(400)
      .json({ message: "sessionId, sender, and text are required" });
  }

  // Find existing chat session or create a new one
  let chatSession = await ChatBot.findOne({ sessionId });
  if (!chatSession) {
    chatSession = new ChatBot({ sessionId, messages: [] });
  }

  // Add the message
  chatSession.messages.push({ sender, text });

  await chatSession.save();

  res.status(200).json({
    message: "Message saved successfully",
    chat: chatSession,
  });
});

/**
 * Fetch full chat history for a session
 */
export const getChatHistory = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  const chatSession = await ChatBot.findOne({ sessionId });

  if (!chatSession) {
    return res.status(404).json({ message: "Chat session not found" });
  }

  res.status(200).json(chatSession.messages);
});

/**
 * Search properties based on user query
 */
const searchProperties = async (budget, area, propertyType, transactionType = 'rent') => {
  try {
    console.log('Searching properties with:', { budget, area, propertyType, transactionType });
    
    // Build query step by step
    const query = {};
    
    // Add status filter (show approved or pending properties)
    query.$or = [
      { status: "approved" }, 
      { status: "pending" }, 
      { status: { $exists: false } }
    ];

    // Add transaction type filter
    if (transactionType === 'rent') {
      query.type = 'rent';
    } else if (transactionType === 'buy') {
      query.type = 'sell';
    }
    
    // If no transaction type specified, search both
    if (!transactionType || transactionType === 'any') {
      query.$or = [
        { type: 'rent' },
        { type: 'sell' }
      ];
    }

    // Add area filter (search in address or name) - make it optional
    if (area) {
      const areaRegex = { $regex: area, $options: 'i' };
      if (!query.$and) query.$and = [];
      query.$and.push({ $or: [
        { address: areaRegex },
        { name: areaRegex }
      ]});
    }

    // Add property type filter (apartment, house, etc.) - make it optional
    if (propertyType && propertyType !== 'any') {
      const typeRegex = { $regex: propertyType, $options: 'i' };
      if (!query.$and) query.$and = [];
      query.$and.push({ $or: [
        { type: typeRegex },
        { name: typeRegex }
      ]});
    }

    // Add budget filter
    if (budget) {
      const budgetNum = parseInt(budget);
      if (budgetNum > 0) {
        query.regularPrice = { $lte: budgetNum };
      }
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    let properties = await Listing.find(query)
      .limit(5)
      .sort({ createdAt: -1 });

    console.log(`Found ${properties.length} properties with specific query`);

    // If no properties found with specific criteria, try a broader search
    if (properties.length === 0) {
      console.log('No properties found with specific criteria, trying broader search...');
      const broaderQuery = {
        $or: [
          { status: "approved" }, 
          { status: "pending" }, 
          { status: { $exists: false } }
        ]
      };
      
      // Add budget filter if specified
      if (budget) {
        const budgetNum = parseInt(budget);
        if (budgetNum > 0) {
          broaderQuery.regularPrice = { $lte: budgetNum };
        }
      }
      
      properties = await Listing.find(broaderQuery)
        .limit(5)
        .sort({ createdAt: -1 });
      
      console.log(`Found ${properties.length} properties with broader search`);
    }

    const mappedProperties = properties.map(property => ({
      _id: property._id,
      name: property.name,
      address: property.address,
      price: property.regularPrice,
      type: property.type,
      bedrooms: property.beds,
      bathrooms: property.baths,
      imageUrls: property.images ? property.images.map(img => `${process.env.BASE_URL || 'http://localhost:8000'}${img}`) : []
    }));

    console.log('Mapped properties:', mappedProperties.length);
    return mappedProperties;
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
};

/**
 * Handle dynamic bot replies with enhanced AI capabilities
 */
export const handleChatMessage = catchAsync(async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Please type a message first." });
  }

  const text = message.toLowerCase();
  let reply = "";

  // Enhanced budget detection (supports various formats)
  const budgetMatch = text.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  const budget = budgetMatch ? budgetMatch[1].replace(/,/g, '') : null;

  // Expanded area detection (case insensitive)
  const areas = [
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "darwin", "hobart",
    "parramatta", "strathfield", "burwood", "ashfield", "newtown", "bondi",
    "manly", "north sydney", "chatswood", "hornsby", "blacktown", "penrith",
    "richmond", "box hill", "frankston", "geelong", "ballarat", "bendigo"
  ];
  const area = areas.find((a) => text.toLowerCase().includes(a.toLowerCase()));

  // Property type detection (case insensitive)
  const propertyTypes = ["apartment", "house", "unit", "townhouse", "villa", "studio", "penthouse"];
  const propertyType = propertyTypes.find((type) => text.toLowerCase().includes(type.toLowerCase()));
  
  console.log('Detected patterns:', { budget, area, propertyType, text });

  // Greeting patterns
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  const isGreeting = greetings.some(greeting => text.includes(greeting));

  // Help patterns
  const helpPatterns = ["help", "what can you do", "how can you help", "assist"];
  const isHelpRequest = helpPatterns.some(pattern => text.includes(pattern));

  // Features patterns
  const featuresPatterns = ["features", "services", "capabilities", "what do you offer"];
  const isFeaturesRequest = featuresPatterns.some(pattern => text.includes(pattern));

  if (isGreeting) {
    reply = `👋 Hello! I'm your AI real estate assistant. I can help you:
    • 🏠 Find properties to rent or buy
    • 💰 Search by budget and location
    • 🔍 Get property recommendations
    • ❤️ Save your favorites
    • 📊 Analyze market trends
    
    What would you like to do today?`;
  } else if (isHelpRequest || isFeaturesRequest) {
    reply = `🤖 I'm your intelligent real estate assistant! Here's what I can do:
    
    🏠 **Property Search**
    • Find rentals and sales
    • Filter by price, location, type
    • Get personalized recommendations
    
    💡 **Smart Features**
    • AI-powered property matching
    • Market trend analysis
    • Investment insights
    
    🎯 **Quick Actions**
    • Save favorites
    • Schedule viewings
    • Get property details
    
    Just tell me what you're looking for! (e.g., "2 bedroom apartment in Sydney under $2000")`;
  } else if (text.includes("rent") || text.includes("rental")) {
    if (budget && area) {
      // Search for actual properties
      const properties = await searchProperties(budget, area, propertyType, 'rent');
      
      if (properties.length > 0) {
        reply = `🏠 Found ${properties.length} properties in ${area} under $${budget}!\n\n`;
        properties.forEach((property, index) => {
          reply += `${index + 1}. **${property.name}**\n`;
          reply += `   📍 ${property.address}\n`;
          reply += `   💰 $${property.price}/week\n`;
          reply += `   🛏️ ${property.bedrooms} bed • 🚿 ${property.bathrooms} bath\n`;
          reply += `   🔗 View: /listing/${property._id}\n\n`;
        });
        reply += `Would you like to see more details about any of these properties?`;
      } else {
        reply = `Sorry, I couldn't find any properties in ${area} under $${budget}. 😔
        
        Try:
        • Increasing your budget slightly
        • Checking nearby areas
        • Different property types
        
        What would you like to try?`;
      }
    } else if (budget) {
      reply = `Renting under $${budget}? 🏠
      
      Tell me:
      • Which area? (Sydney, Melbourne, etc.)
      • What type? (Apartment, House, etc.)`;
    } else if (area) {
      reply = `Renting in ${area}? 🏠
      
      I need to know:
      • Your budget range
      • Property type preference`;
    } else {
      reply = `Looking to rent? 🏠
      
      I can help! Please tell me:
      • Your preferred area
      • Budget range
      • Property type (apartment, house, etc.)`;
    }
  } else if (text.includes("buy") || text.includes("purchase")) {
    if (budget && area) {
      // Search for actual properties for sale
      const properties = await searchProperties(budget, area, propertyType, 'buy');
      
      if (properties.length > 0) {
        reply = `🏡 Found ${properties.length} properties for sale in ${area} under $${budget}!\n\n`;
        properties.forEach((property, index) => {
          reply += `${index + 1}. **${property.name}**\n`;
          reply += `   📍 ${property.address}\n`;
          reply += `   💰 $${property.price.toLocaleString()}\n`;
          reply += `   🛏️ ${property.bedrooms} bed • 🚿 ${property.bathrooms} bath\n`;
          reply += `   🔗 View: /listing/${property._id}\n\n`;
        });
        reply += `Would you like to see more details about any of these properties?`;
      } else {
        reply = `Sorry, I couldn't find any properties for sale in ${area} under $${budget}. 😔
        
        Try:
        • Increasing your budget
        • Checking nearby areas
        • Different property types
        
        What would you like to try?`;
      }
    } else if (budget) {
      reply = `Buying with a budget of $${budget}? 🏡
      
      I need to know:
      • Which area interests you?
      • What type of property?`;
    } else if (area) {
      reply = `Buying in ${area}? 🏡
      
      Tell me:
      • Your budget range
      • Property type preference`;
    } else {
      reply = `Looking to buy? 🏡
      
      I can help! Please share:
      • Your preferred area
      • Budget range
      • Property type (house, apartment, etc.)`;
    }
  } else if (text.includes("recommend") || text.includes("suggest")) {
    reply = `🎯 I'd love to recommend properties for you!
    
    To give you the best suggestions, tell me:
    • Are you looking to rent or buy?
    • Your preferred area
    • Budget range
    • Property type
    
    I'll use AI to find perfect matches for you!`;
  } else if (text.includes("favorite") || text.includes("save")) {
    reply = `❤️ Great! I can help you save properties to your favorites.
    
    When you find a property you like, just let me know and I'll:
    • Add it to your favorites list
    • Send you updates about similar properties
    • Notify you of price changes
    
    What type of properties are you interested in saving?`;
  } else if (text.includes("market") || text.includes("trend")) {
    reply = `📊 I can provide market insights and trends!
    
    I can analyze:
    • Price trends in different areas
    • Market forecasts
    • Investment opportunities
    • Comparative market analysis
    
    Which area's market would you like to know about?`;
  } else if (text.includes("thank")) {
    reply = `You're very welcome! 😊
    
    I'm here whenever you need help with:
    • Finding properties
    • Market insights
    • Investment advice
    • General real estate questions
    
    Is there anything else I can help you with?`;
  } else {
    // Check if we have budget and area for property search
    if (budget && area) {
      // This will be handled by the property search logic below
      reply = `Let me search for properties in ${area} under $${budget}...`;
    } else {
      reply = `I'm here to help with all your real estate needs! 🤖
      
      I can assist with:
      • 🏠 Finding properties (rent/buy)
      • 💰 Budget and location searches
      • 🎯 Personalized recommendations
      • 📊 Market analysis
      • ❤️ Managing favorites
      
      Just tell me what you're looking for! (e.g., "2 bedroom apartment in Sydney under $2000")`;
    }
  }

  // Check if we found properties and include them in response
  let properties = [];
  
  // Always try to search for properties if we have any criteria OR if user asks for properties
  if (budget || area || propertyType || text.toLowerCase().includes('properties') || text.toLowerCase().includes('show') || text.toLowerCase().includes('find')) {
    // Determine transaction type based on keywords
    let transactionType = 'rent'; // default
    if (text.includes("buy") || text.includes("purchase") || text.includes("sale")) {
      transactionType = 'buy';
    } else if (text.includes("rent") || text.includes("rental") || text.includes("lease")) {
      transactionType = 'rent';
    }
    
    console.log('Searching properties with:', { budget, area, propertyType, transactionType });
    properties = await searchProperties(budget, area, propertyType, transactionType);
    
    // Update reply if we found properties
    if (properties.length > 0) {
      reply = `🏠 Found ${properties.length} properties for you!\n\n`;
      properties.forEach((property, index) => {
        reply += `${index + 1}. **${property.name}**\n`;
        reply += `   📍 ${property.address}\n`;
        reply += `   💰 $${property.price}${transactionType === 'rent' ? '/week' : ''}\n`;
        reply += `   🛏️ ${property.bedrooms} bed • 🚿 ${property.bathrooms} bath\n`;
        reply += `   🔗 View: /listing/${property._id}\n\n`;
      });
      reply += `Would you like to see more details about any of these properties?`;
    } else {
      // Try a broader search to show any available properties
      console.log('No specific matches found, trying broader search...');
      const broaderProperties = await searchProperties(null, null, null, 'any');
      
      if (broaderProperties.length > 0) {
        reply = `I couldn't find properties matching your exact criteria, but here are some available properties:\n\n`;
        broaderProperties.slice(0, 3).forEach((property, index) => {
          reply += `${index + 1}. **${property.name}**\n`;
          reply += `   📍 ${property.address}\n`;
          reply += `   💰 $${property.price}\n`;
          reply += `   🛏️ ${property.bedrooms} bed • 🚿 ${property.bathrooms} bath\n\n`;
        });
        reply += `Would you like to see more details about any of these properties?`;
        properties = broaderProperties.slice(0, 3);
      } else {
        reply = `Sorry, I couldn't find any properties matching your criteria. 😔
        
        Try:
        • Being more specific about location
        • Adjusting your budget
        • Different property types
        
        What would you like to try?`;
      }
    }
  }

  // Save to DB
  let chatSession = await ChatBot.findOne({ sessionId });
  if (!chatSession) {
    chatSession = new ChatBot({ sessionId, messages: [] });
  }
  
  const botMessage = { sender: "bot", text: reply };
  if (properties.length > 0) {
    botMessage.properties = properties;
  }
  
  chatSession.messages.push({ sender: "user", text: message });
  chatSession.messages.push(botMessage);
  await chatSession.save();

  res.status(200).json({ reply, properties });
});

/**
 * Clear chat history for a session
 */
export const clearChatHistory = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  const chatSession = await ChatBot.findOne({ sessionId });
  if (chatSession) {
    chatSession.messages = [];
    await chatSession.save();
  }

  res.status(200).json({ message: "Chat history cleared successfully" });
});

/**
 * Test property search endpoint
 */
export const testPropertySearch = catchAsync(async (req, res) => {
  const { budget, area, propertyType, transactionType } = req.query;
  
  console.log('Test search with:', { budget, area, propertyType, transactionType });
  
  const properties = await searchProperties(budget, area, propertyType, transactionType || 'rent');
  
  res.status(200).json({ 
    message: "Test search completed",
    query: { budget, area, propertyType, transactionType },
    properties,
    count: properties.length
  });
});

/**
 * Get all properties for testing
 */
export const getAllProperties = catchAsync(async (req, res) => {
  try {
    const properties = await Listing.find({})
      .limit(10)
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: "All properties retrieved",
      properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Error getting all properties:', error);
    res.status(500).json({ message: "Error retrieving properties", error: error.message });
  }
});
